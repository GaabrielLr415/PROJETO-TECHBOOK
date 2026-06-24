(function () {
  /* JAVASCRIPT: APP GLOBAL */

  // CHAVES DE SESSAO E API
  const SESSION_KEY = "techbook-session";
  const FLASH_KEY = "techbook-flash";
  const LEGACY_STORAGE_KEY = "techbook-mock-db";
  const ADMIN_AUTH_KEY = "techbook-admin-auth";
  const API_BASE = "http://localhost:8080/api";
  const REQUEST_TIMEOUT_MS = 8000;

  localStorage.removeItem(LEGACY_STORAGE_KEY);

  // REQUISICOES PARA API
  // Centraliza headers, token do cliente, token do admin e tratamento de erro.
  async function request(path, options = {}) {
    const method = options.method || "GET";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const fetchOptions = {
      method,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal
    };
    const adminSession = getAdminSession();
    const clientSession = getSession();

    if (adminSession?.token) {
      fetchOptions.headers["X-Admin-Token"] = adminSession.token;
    }

    if (clientSession?.token) {
      fetchOptions.headers["X-Client-Token"] = clientSession.token;
    }

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, fetchOptions);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.erro || "Não foi possível concluir a operação.");
      }
      if (response.status === 204) {
        return null;
      }
      const payload = await response.json();
      return normalizeResponse(path, payload);
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("A conexão com o backend demorou para responder. Confira se a API está ligada e tente novamente.");
      }
      if (error instanceof Error && !/Failed to fetch|NetworkError|Load failed/i.test(error.message)) {
        throw error;
      }
      throw new Error("Não foi possível conectar ao backend em http://localhost:8080/api. Inicie a API para concluir a integração.");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // SESSAO DO CLIENTE
  function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // SESSAO DO ADMINISTRADOR
  function getAdminSession() {
    try {
      return JSON.parse(sessionStorage.getItem(ADMIN_AUTH_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  // MENSAGENS ENTRE PAGINAS
  function setFlashMessage(message, type = "success") {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
  }

  function consumeFlashMessage() {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) {
      return null;
    }

    sessionStorage.removeItem(FLASH_KEY);

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  // FORMATACAO E SEGURANCA VISUAL
  function formatDate(value) {
    if (!value) return "-";
    return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // NORMALIZACAO DAS RESPOSTAS
  // Mantem o frontend independente do formato exato retornado pelo backend.
  function normalizeResponse(path, payload) {
    const cleanPath = path.split("?")[0];

    if (cleanPath === "/livros" || cleanPath === "/livros/mais-procurados") {
      return Array.isArray(payload) ? payload.map(normalizeBook) : normalizeBook(payload);
    }
    if (cleanPath.startsWith("/livros/")) {
      return normalizeBook(payload);
    }
    if (cleanPath === "/clientes") {
      return Array.isArray(payload) ? payload.map(normalizeClient) : normalizeClient(payload);
    }
    if (cleanPath === "/clientes/recuperar-senha") {
      return normalizeClient(payload);
    }
    if (/^\/clientes\/\d+(\/bloqueio|\/senha)?$/.test(cleanPath)) {
      return normalizeClient(payload);
    }
    if (cleanPath.endsWith("/reservas") || cleanPath === "/reservas") {
      return Array.isArray(payload) ? payload.map(normalizeReservation) : normalizeReservation(payload);
    }
    if (cleanPath.endsWith("/emprestimos") || cleanPath === "/emprestimos") {
      return Array.isArray(payload) ? payload.map(normalizeLoan) : normalizeLoan(payload);
    }
    if (cleanPath.endsWith("/devolucoes") || cleanPath === "/emprestimos/devolucoes") {
      return Array.isArray(payload) ? payload.map(normalizeReturn) : normalizeReturn(payload);
    }
    if (cleanPath === "/administracao/dashboard") {
      return normalizeDashboard(payload);
    }
    return payload;
  }

  // NORMALIZACAO DE LIVRO
  function normalizeBook(book = {}) {
    return {
      id: Number(book.id) || 0,
      titulo: book.titulo || "",
      autor: book.autor || "",
      categoria: book.categoria || "",
      descricao: book.descricao || "",
      imagemUrl: book.imagemUrl || book.imagem_url || "img/livros.png",
      quantidadeTotal: Number(book.quantidadeTotal ?? book.quantidade_total) || 0,
      quantidadeDisponivel: Number(book.quantidadeDisponivel ?? book.quantidade_disponivel) || 0,
      quantidadeReservavel: Number(book.quantidadeReservavel ?? book.quantidade_reservavel ?? book.quantidadeDisponivel ?? book.quantidade_disponivel) || 0,
      status: book.status || "INDISPONIVEL"
    };
  }

  // NORMALIZACAO DE CLIENTE
  function normalizeClient(client = {}) {
    return {
      id: Number(client.id ?? client.usuarioId ?? client.usuario_id) || 0,
      nome: client.nome || "",
      cpf: client.cpf || "",
      email: client.email || "",
      telefone: client.telefone || "",
      token: client.token || "",
      bloqueado: Boolean(client.bloqueado),
      motivoBloqueio: client.motivoBloqueio || client.motivo_bloqueio || ""
    };
  }

  // NORMALIZACAO DE RESERVA
  function normalizeReservation(reservation = {}) {
    return {
      id: Number(reservation.id) || 0,
      clienteId: Number(reservation.clienteId ?? reservation.cliente_id ?? reservation.cliente?.id) || 0,
      livroId: Number(reservation.livroId ?? reservation.livro_id ?? reservation.livro?.id) || 0,
      dataReserva: reservation.dataReserva || reservation.data_reserva || "",
      prazoRetirada: reservation.prazoRetirada || reservation.prazo_retirada || "",
      status: reservation.status || "",
      cliente: normalizeClient(reservation.cliente || {}),
      livro: normalizeBook(reservation.livro || {})
    };
  }

  // NORMALIZACAO DE EMPRESTIMO
  function normalizeLoan(loan = {}) {
    return {
      id: Number(loan.id) || 0,
      clienteId: Number(loan.clienteId ?? loan.cliente_id ?? loan.cliente?.id) || 0,
      livroId: Number(loan.livroId ?? loan.livro_id ?? loan.livro?.id) || 0,
      administradorId: Number(loan.administradorId ?? loan.administrador_id ?? loan.administrador?.id) || 0,
      reservaId: Number(loan.reservaId ?? loan.reserva_id ?? loan.reserva?.id) || null,
      dataEmprestimo: loan.dataEmprestimo || loan.data_emprestimo || "",
      dataDevolucaoPrevista: loan.dataDevolucaoPrevista || loan.data_devolucao_prevista || "",
      status: loan.status || "",
      renovado: Boolean(loan.renovado),
      estadoLivro: loan.estadoLivro || loan.estado_livro || "",
      observacaoDevolucao: loan.observacaoDevolucao || loan.observacao_devolucao || "",
      historicoContato: loan.historicoContato || loan.historico_contato || "",
      cliente: normalizeClient(loan.cliente || {}),
      livro: normalizeBook(loan.livro || {})
    };
  }

  // NORMALIZACAO DE DEVOLUCAO
  function normalizeReturn(returnItem = {}) {
    return {
      id: Number(returnItem.id) || 0,
      emprestimoId: Number(returnItem.emprestimoId ?? returnItem.emprestimo_id ?? returnItem.emprestimo?.id) || 0,
      administradorId: Number(returnItem.administradorId ?? returnItem.administrador_id) || 0,
      dataDevolucao: returnItem.dataDevolucao || returnItem.data_devolucao || "",
      estadoLivro: returnItem.estadoLivro || returnItem.estado_livro || "",
      statusDevolucao: returnItem.statusDevolucao || returnItem.status_devolucao || "",
      observacao: returnItem.observacao || "",
      cliente: normalizeClient(returnItem.cliente || {}),
      livro: normalizeBook(returnItem.livro || {})
    };
  }

  // NORMALIZACAO DO DASHBOARD
  function normalizeDashboard(dashboard = {}) {
    return {
      totalLivros: Number(dashboard.totalLivros) || 0,
      emprestimosAtivos: Number(dashboard.emprestimosAtivos) || 0,
      atrasados: Number(dashboard.atrasados) || 0,
      usuarios: Number(dashboard.usuarios) || 0,
      reservasPendentes: Number(dashboard.reservasPendentes) || 0,
      livrosDisponiveis: Number(dashboard.livrosDisponiveis) || 0,
      livrosIndisponiveis: Number(dashboard.livrosIndisponiveis) || 0
    };
  }

  // API GLOBAL USADA PELAS PAGINAS
  window.TechBookApp = {
    request,
    getSession,
    setSession,
    clearSession,
    setFlashMessage,
    consumeFlashMessage,
    formatDate,
    escapeHtml
  };
})();
