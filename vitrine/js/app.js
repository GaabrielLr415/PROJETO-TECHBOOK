(function () {
  /* JAVASCRIPT: APP GLOBAL */

  // CHAVES DE SESSAO E API
  const SESSION_KEY = "techbook-session";
  const FLASH_KEY = "techbook-flash";
  const LEGACY_STORAGE_KEY = "techbook-mock-db";
  const ADMIN_AUTH_KEY = "techbook-admin-auth";
  const API_BASE = "http://localhost:8080/api";
  const REQUEST_TIMEOUT_MS = 8000;
  const VITRINE_MODE = true;

  // DADOS DEMONSTRATIVOS DA VITRINE
  // Usados apenas no GitHub Pages para apresentar o visual sem depender do backend.
  const DEMO_CLIENT = {
    id: 1,
    nome: "Cliente Demonstração",
    cpf: "00000000000",
    email: "cliente.demo@techbook.local",
    telefone: "(11) 99999-0000",
    token: "demo-client-token",
    bloqueado: false,
    motivoBloqueio: ""
  };

  const DEMO_USERS = [
    DEMO_CLIENT,
    {
      id: 2,
      nome: "Marina Souza",
      cpf: "11111111111",
      email: "marina.demo@techbook.local",
      telefone: "(11) 98888-1111",
      token: "",
      bloqueado: false,
      motivoBloqueio: ""
    },
    {
      id: 3,
      nome: "Lucas Oliveira",
      cpf: "22222222222",
      email: "lucas.demo@techbook.local",
      telefone: "(11) 97777-2222",
      token: "",
      bloqueado: true,
      motivoBloqueio: "Emprestimo atrasado demonstrativo."
    }
  ];

  const DEMO_BOOKS = [
    {
      id: 1,
      titulo: "Dom Casmurro",
      autor: "Machado de Assis",
      categoria: "Romance",
      descricao: "Classico da literatura brasileira que acompanha Bento Santiago, Capitu e uma das duvidas mais famosas da nossa literatura.",
      imagemUrl: "img/transferir.jfif",
      quantidadeTotal: 8,
      quantidadeDisponivel: 5,
      quantidadeReservavel: 5,
      status: "DISPONIVEL"
    },
    {
      id: 2,
      titulo: "Harry Potter e a Pedra Filosofal",
      autor: "J.K. Rowling",
      categoria: "Fantasia",
      descricao: "Uma aventura sobre amizade, descoberta e magia, usada aqui como exemplo visual do catalogo da TechBook.",
      imagemUrl: "img/Os novos Harry, Rony e Hermione_ conheça o trio de atores do remake de Harry Potter.jfif",
      quantidadeTotal: 10,
      quantidadeDisponivel: 4,
      quantidadeReservavel: 4,
      status: "DISPONIVEL"
    },
    {
      id: 3,
      titulo: "A Hora da Estrela",
      autor: "Clarice Lispector",
      categoria: "Drama",
      descricao: "Obra marcante sobre existencia, linguagem e sensibilidade, representando a curadoria literaria do projeto.",
      imagemUrl: "img/transferir (1).jfif",
      quantidadeTotal: 6,
      quantidadeDisponivel: 3,
      quantidadeReservavel: 3,
      status: "DISPONIVEL"
    },
    {
      id: 4,
      titulo: "Jogos Vorazes",
      autor: "Suzanne Collins",
      categoria: "Ficção Científica",
      descricao: "Uma distopia de aventura e resistencia, exibida na vitrine para mostrar filtros e detalhes de livros.",
      imagemUrl: "img/transferir (2).jfif",
      quantidadeTotal: 7,
      quantidadeDisponivel: 2,
      quantidadeReservavel: 2,
      status: "DISPONIVEL"
    },
    {
      id: 5,
      titulo: "O Iluminado",
      autor: "Stephen King",
      categoria: "Terror",
      descricao: "Exemplo de obra indisponivel no momento, demonstrando como o sistema comunica disponibilidade ao leitor.",
      imagemUrl: "img/livros.png",
      quantidadeTotal: 5,
      quantidadeDisponivel: 0,
      quantidadeReservavel: 0,
      status: "INDISPONIVEL"
    },
    {
      id: 6,
      titulo: "Pequeno Manual de Leitura",
      autor: "TechForce",
      categoria: "Educacional",
      descricao: "Livro demonstrativo criado para representar o objetivo do projeto: aproximar estudantes e leitores do acesso aos livros.",
      imagemUrl: "img/hero.png",
      quantidadeTotal: 12,
      quantidadeDisponivel: 8,
      quantidadeReservavel: 8,
      status: "DISPONIVEL"
    }
  ];

  const DEMO_RESERVATIONS = [
    {
      id: 101,
      clienteId: 1,
      livroId: 1,
      dataReserva: "2026-06-20",
      prazoRetirada: "2026-06-21",
      status: "PENDENTE",
      cliente: DEMO_CLIENT,
      livro: DEMO_BOOKS[0]
    },
    {
      id: 102,
      clienteId: 1,
      livroId: 3,
      dataReserva: "2026-06-12",
      prazoRetirada: "2026-06-13",
      status: "EXPIRADA",
      cliente: DEMO_CLIENT,
      livro: DEMO_BOOKS[2]
    }
  ];

  const DEMO_LOANS = [
    {
      id: 201,
      clienteId: 1,
      livroId: 2,
      administradorId: 1,
      reservaId: 100,
      dataEmprestimo: "2026-06-15",
      dataDevolucaoPrevista: "2026-06-29",
      status: "ATIVO",
      renovado: false,
      estadoLivro: "",
      observacaoDevolucao: "",
      historicoContato: "",
      cliente: DEMO_CLIENT,
      livro: DEMO_BOOKS[1]
    },
    {
      id: 202,
      clienteId: 1,
      livroId: 4,
      administradorId: 1,
      reservaId: 99,
      dataEmprestimo: "2026-06-01",
      dataDevolucaoPrevista: "2026-06-14",
      status: "ATRASADO",
      renovado: true,
      estadoLivro: "",
      observacaoDevolucao: "",
      historicoContato: "Contato demonstrativo registrado pelo painel administrativo.",
      cliente: DEMO_CLIENT,
      livro: DEMO_BOOKS[3]
    }
  ];

  const DEMO_RETURNS = [
    {
      id: 301,
      emprestimoId: 199,
      administradorId: 1,
      dataDevolucao: "2026-06-10",
      estadoLivro: "Bom",
      statusDevolucao: "REGISTRADA",
      observacao: "Devolucao demonstrativa para a vitrine.",
      cliente: DEMO_CLIENT,
      livro: DEMO_BOOKS[2]
    }
  ];

  localStorage.removeItem(LEGACY_STORAGE_KEY);

  // REQUISICOES PARA API
  // Centraliza headers, token do cliente, token do admin e tratamento de erro.
  async function request(path, options = {}) {
    if (VITRINE_MODE) {
      return demoRequest(path, options);
    }

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

  function demoRequest(path, options = {}) {
    const cleanPath = path.split("?")[0];
    const method = options.method || "GET";

    if (cleanPath === "/livros") {
      return DEMO_BOOKS.map(normalizeBook);
    }

    if (cleanPath === "/livros/mais-procurados") {
      return DEMO_BOOKS
        .filter((book) => book.quantidadeReservavel > 0)
        .slice(0, 5)
        .map(normalizeBook);
    }

    if (cleanPath.startsWith("/livros/")) {
      const bookId = Number(cleanPath.split("/").pop());
      const book = DEMO_BOOKS.find((item) => item.id === bookId);
      if (!book) {
        throw new Error("Livro nao encontrado na vitrine.");
      }
      return normalizeBook(book);
    }

    if (cleanPath === "/clientes/login") {
      return normalizeClient(DEMO_CLIENT);
    }

    if (cleanPath === "/clientes") {
      if (method === "POST") {
        return normalizeClient(DEMO_CLIENT);
      }
      return DEMO_USERS.map(normalizeClient);
    }

    if (/^\/clientes\/\d+$/.test(cleanPath) && method === "GET") {
      return normalizeClient(DEMO_CLIENT);
    }

    if (/^\/clientes\/\d+$/.test(cleanPath) || /^\/clientes\/\d+\/senha$/.test(cleanPath)) {
      return normalizeClient(DEMO_CLIENT);
    }

    if (/^\/clientes\/\d+\/bloqueio$/.test(cleanPath)) {
      return normalizeClient({ ...DEMO_CLIENT, bloqueado: method !== "DELETE" });
    }

    if (cleanPath === "/clientes/recuperar-senha/codigo") {
      return { mensagem: "Vitrine demonstrativa: use o codigo 123456 para visualizar o fluxo." };
    }

    if (cleanPath === "/clientes/recuperar-senha/verificar") {
      return { mensagem: "Codigo validado na vitrine. Agora informe uma nova senha." };
    }

    if (cleanPath === "/clientes/recuperar-senha") {
      return normalizeClient(DEMO_CLIENT);
    }

    if (cleanPath.endsWith("/reservas") || cleanPath === "/reservas") {
      if (method === "POST") {
        const livro = DEMO_BOOKS.find((book) => book.id === Number(options.body?.livroId)) || DEMO_BOOKS[0];
        return normalizeReservation({
          id: 999,
          clienteId: 1,
          livroId: livro.id,
          dataReserva: "2026-06-24",
          prazoRetirada: "2026-06-25",
          status: "PENDENTE",
          cliente: DEMO_CLIENT,
          livro
        });
      }
      return DEMO_RESERVATIONS.map(normalizeReservation);
    }

    if (/^\/reservas\/\d+\/cancelar$/.test(cleanPath)) {
      return normalizeReservation({ ...DEMO_RESERVATIONS[0], status: "CANCELADA" });
    }

    if (cleanPath.endsWith("/emprestimos") || cleanPath === "/emprestimos") {
      return DEMO_LOANS.map(normalizeLoan);
    }

    if (cleanPath === "/emprestimos/confirmar-retirada") {
      return normalizeLoan(DEMO_LOANS[0]);
    }

    if (cleanPath === "/emprestimos/devolucoes" || cleanPath.endsWith("/devolucoes")) {
      if (method === "POST") {
        return normalizeReturn(DEMO_RETURNS[0]);
      }
      return DEMO_RETURNS.map(normalizeReturn);
    }

    if (/^\/emprestimos\/\d+\/renovar$/.test(cleanPath)) {
      return normalizeLoan({ ...DEMO_LOANS[0], renovado: true });
    }

    if (/^\/emprestimos\/\d+\/contato$/.test(cleanPath) || /^\/emprestimos\/\d+\/extraviar$/.test(cleanPath)) {
      return normalizeLoan(DEMO_LOANS[1]);
    }

    if (cleanPath === "/administracao/login") {
      return {
        nome: "Administrador Demo",
        email: "admin@techbook.local",
        token: "demo-admin-token"
      };
    }

    if (cleanPath === "/administracao/dashboard") {
      return normalizeDashboard({
        totalLivros: DEMO_BOOKS.length,
        emprestimosAtivos: DEMO_LOANS.filter((loan) => loan.status === "ATIVO").length,
        atrasados: DEMO_LOANS.filter((loan) => loan.status === "ATRASADO").length,
        usuarios: 18,
        reservasPendentes: DEMO_RESERVATIONS.filter((item) => item.status === "PENDENTE").length,
        livrosDisponiveis: DEMO_BOOKS.filter((book) => book.quantidadeReservavel > 0).length,
        livrosIndisponiveis: DEMO_BOOKS.filter((book) => book.quantidadeReservavel <= 0).length
      });
    }

    return {
      mensagem: "Acao demonstrativa da vitrine. A versao completa depende do backend Java."
    };
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
    isVitrine: VITRINE_MODE,
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
