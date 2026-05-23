(function () {
  const app = window.TechBookApp;
  const PREFILL_RESERVATION_KEY = "techbook.admin.prefillReservationId";
  const EDIT_BOOK_KEY = "techbook.admin.editBookId";
  const ADMIN_AUTH_KEY = "techbook-admin-auth";
  let selectedBookId = null;
  let pendingReservations = [];
  let cachedUsers = [];
  let cachedBooks = [];
  let cachedLateLoans = [];
  let loanPrefillApplied = false;
  let bookPrefillApplied = false;

  if (document.body.dataset.page === "admin-login") {
    bindAdminLoginForm();
    return;
  }

  if (!ensureAdminAuth()) {
    return;
  }

  renderAdminLogout();
  bindIfPresent("refreshDashboard", "click", loadDashboard);
  bindIfPresent("loanForm", "submit", submitLoanForm);
  bindIfPresent("returnForm", "submit", submitReturnForm);
  bindIfPresent("bookForm", "submit", submitBookForm);
  bindIfPresent("deleteBookButton", "click", deleteSelectedBook);
  bindIfPresent("editBookButton", "click", focusSelectedBook);
  bindIfPresent("bookSearchButton", "click", filterBooks);
  bindIfPresent("userSearchButton", "click", filterUsers);
  bindIfPresent("lateSearchButton", "click", filterLateLoans);

  loadDashboard();

  function bindIfPresent(id, eventName, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(eventName, handler);
    }
  }

  function setTextIfPresent(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderDashboardInsights(books, reservations, loans) {
    renderTopReservedBooks(reservations);
    renderCategoryDashboard(books);
    renderManagementAlerts(books, reservations, loans);
  }

  function renderTopReservedBooks(reservations) {
    const container = document.getElementById("topReservedList");
    if (!container) return;

    const ranking = Object.values(reservations.reduce((acc, reservation) => {
      const title = reservation.livro?.titulo || "Livro sem titulo";
      acc[title] = acc[title] || { title, total: 0 };
      acc[title].total += 1;
      return acc;
    }, {}))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    if (!ranking.length) {
      container.innerHTML = '<p class="empty-insight">Ainda não existem reservas registradas.</p>';
      return;
    }

    container.innerHTML = ranking.map((item, index) => `
      <div class="rank-item">
        <span class="rank-position">${index + 1}</span>
        <span class="rank-title">${app.escapeHtml(item.title)}</span>
        <span class="rank-count">${item.total} reserva${item.total === 1 ? "" : "s"}</span>
      </div>
    `).join("");
  }

  function renderCategoryDashboard(books) {
    const container = document.getElementById("categoryDashboardList");
    if (!container) return;

    const categories = Object.values(books.reduce((acc, book) => {
      const category = book.categoria || "Sem categoria";
      acc[category] = acc[category] || { category, total: 0, available: 0 };
      acc[category].total += 1;
      acc[category].available += Number(book.quantidadeDisponivel || 0);
      return acc;
    }, {}))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    if (!categories.length) {
      container.innerHTML = '<p class="empty-insight">Cadastre livros para visualizar as categorias.</p>';
      return;
    }

    const maxTotal = Math.max(...categories.map((item) => item.total), 1);
    container.innerHTML = categories.map((item) => {
      const width = Math.max(12, Math.round((item.total / maxTotal) * 100));
      return `
        <div class="category-item">
          <span class="category-title">${app.escapeHtml(item.category)}</span>
          <div class="category-bar"><span style="width: ${width}%"></span></div>
          <div class="category-meta">
            <span>${item.total} livro${item.total === 1 ? "" : "s"}</span>
            <span>${item.available} disponíve${item.available === 1 ? "l" : "is"}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderManagementAlerts(books, reservations, loans) {
    const container = document.getElementById("managementAlerts");
    if (!container) return;

    const pendingReservations = reservations.filter((item) => item.status === "PENDENTE").length;
    const overdueLoans = loans.filter((loan) => loan.status === "ATRASADO").length;
    const unavailableBooks = books.filter((book) => Number(book.quantidadeDisponivel || 0) <= 0).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pending = reservations.filter((item) => item.status === "PENDENTE");
    const dueToday = pending.filter((item) => daysUntil(item.prazoRetirada, today) === 0).length;
    const dueSoon = pending.filter((item) => {
      const days = daysUntil(item.prazoRetirada, today);
      return days > 0 && days <= 2;
    }).length;
    const highDemand = findHighDemandWithLowStock(books, reservations);

    const alerts = [];

    if (dueToday) {
      alerts.push({
        title: "Reservas vencem hoje",
        detail: `${dueToday} retirada${dueToday === 1 ? "" : "s"} precisa${dueToday === 1 ? "" : "m"} ser confirmada${dueToday === 1 ? "" : "s"}.`,
        type: "warning",
        href: "adm-reservas.html"
      });
    }

    if (dueSoon) {
      alerts.push({
        title: "Retiradas proximas do prazo",
        detail: `${dueSoon} reserva${dueSoon === 1 ? "" : "s"} vence${dueSoon === 1 ? "" : "m"} nos proximos 2 dias.`,
        type: "warning",
        href: "adm-reservas.html"
      });
    }

    if (highDemand) {
      alerts.push({
        title: "Alta procura com pouco estoque",
        detail: `${highDemand.title} tem ${highDemand.reservations} reserva${highDemand.reservations === 1 ? "" : "s"} e ${highDemand.available} unidade${highDemand.available === 1 ? "" : "s"} livre${highDemand.available === 1 ? "" : "s"}.`,
        type: "warning",
        href: "adm-livros.html"
      });
    }

    if (overdueLoans) {
      alerts.push({
        title: "Emprestimos atrasados",
        detail: `${overdueLoans} devolucao${overdueLoans === 1 ? "" : "oes"} pendente${overdueLoans === 1 ? "" : "s"}.`,
        type: "warning",
        href: "adm-atrasos.html"
      });
    }

    if (!alerts.length) {
      alerts.push({
        title: "Fila sob controle",
        detail: pendingReservations || unavailableBooks
          ? "Sem urgencia para hoje. Acompanhe reservas e estoque normalmente."
          : "Sem pendencias criticas no momento.",
        type: "success",
        href: "adm-reservas.html"
      });
    }

    container.innerHTML = alerts.map((item) => `
      <div class="alert-item ${item.type}">
        <div>
          <span class="alert-title">${app.escapeHtml(item.title)}</span>
          <span class="alert-detail">${app.escapeHtml(item.detail)}</span>
        </div>
        <a class="insight-action" href="${item.href}">Abrir</a>
      </div>
    `).join("");
  }

  function daysUntil(dateValue, today) {
    if (!dateValue) return null;
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return Math.round((date - today) / 86400000);
  }

  function findHighDemandWithLowStock(books, reservations) {
    const pendingCounts = reservations
      .filter((item) => item.status === "PENDENTE")
      .reduce((acc, reservation) => {
        const bookId = reservation.livro?.id;
        if (!bookId) return acc;
        acc[bookId] = (acc[bookId] || 0) + 1;
        return acc;
      }, {});

    return books
      .map((book) => ({
        title: book.titulo || "Livro sem titulo",
        available: Number(book.quantidadeDisponivel || 0),
        reservations: pendingCounts[book.id] || 0
      }))
      .filter((item) => item.reservations >= 2 && item.available <= 1)
      .sort((a, b) => b.reservations - a.reservations)[0];
  }

  async function loadDashboard() {
    try {
      const [dashboard, loans, users, books, reservations, returns] = await Promise.all([
        app.request("/administracao/dashboard"),
        app.request("/emprestimos"),
        app.request("/clientes"),
        app.request("/livros"),
        app.request("/reservas"),
        app.request("/emprestimos/devolucoes")
      ]);

      pendingReservations = reservations;
      cachedUsers = users;
      cachedBooks = books;
      // A lista de atrasados fica em cache para permitir busca local sem novas requisicoes.
      cachedLateLoans = loans.filter((loan) => loan.status === "ATRASADO");

      maybeApplyLoanReservationPrefill();
      maybeApplyBookSelectionPrefill();

      setTextIfPresent("metricBooks", dashboard.totalLivros);
      setTextIfPresent("metricLoans", dashboard.emprestimosAtivos);
      setTextIfPresent("metricLate", dashboard.atrasados);
      setTextIfPresent("metricUsers", dashboard.usuarios);
      setTextIfPresent("metricReservations", dashboard.reservasPendentes);
      setTextIfPresent("metricAvailableBooks", dashboard.livrosDisponiveis);
      setTextIfPresent("metricUnavailableBooks", dashboard.livrosIndisponiveis);
      renderDashboardInsights(books, reservations, loans);

      if (document.getElementById("reservationTable")) {
        renderReservationTable(reservations);
      }
      if (document.getElementById("loanTable")) {
        renderLoanTable(loans);
      }
      if (document.getElementById("returnHistory")) {
        renderReturnHistory(returns);
      }
      if (document.getElementById("lateList")) {
        renderLateList(cachedLateLoans);
      }
      if (document.getElementById("userTable")) {
        renderUsers(users);
      }
      if (document.getElementById("bookTable")) {
        renderBooks(books);
      }
    } catch (error) {
      renderDashboardUnavailable(error.message);
    }
  }

  function renderDashboardUnavailable(message) {
    ["metricBooks", "metricLoans", "metricLate", "metricUsers", "metricReservations", "metricAvailableBooks", "metricUnavailableBooks"]
      .forEach((id) => setTextIfPresent(id, "-"));

    if (document.getElementById("reservationTable")) {
      document.getElementById("reservationTable").innerHTML = `<tr><td colspan="7">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("loanTable")) {
      document.getElementById("loanTable").innerHTML = `<tr><td colspan="8">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("returnHistory")) {
      document.getElementById("returnHistory").innerHTML = `<div class="status-item">${app.escapeHtml(message)}</div>`;
    }
    if (document.getElementById("lateList")) {
      document.getElementById("lateList").innerHTML = `<div class="status-item">${app.escapeHtml(message)}</div>`;
    }
    if (document.getElementById("userTable")) {
      document.getElementById("userTable").innerHTML = `<tr><td colspan="6">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("bookTable")) {
      document.getElementById("bookTable").innerHTML = `<tr><td colspan="9">${app.escapeHtml(message)}</td></tr>`;
    }
  }

  function renderReservationTable(reservations) {
    const rows = reservations
      .sort((a, b) => b.id - a.id)
      .map((reservation) => `
        <tr>
          <td>${reservation.id}</td>
          <td>${app.escapeHtml(reservation.cliente.nome)}</td>
          <td>${app.escapeHtml(reservation.livro.titulo)}</td>
          <td>${app.formatDate(reservation.dataReserva)}</td>
          <td>${app.formatDate(reservation.prazoRetirada)}</td>
          <td>${app.escapeHtml(reservation.status)}</td>
          <td>
            ${reservation.status === "PENDENTE"
              ? `<button class="button primary small" type="button" data-fill-reservation="${reservation.id}">Usar na retirada</button>`
              : '<span class="inline-status">Sem ação</span>'}
          </td>
        </tr>
      `).join("");

    document.getElementById("reservationTable").innerHTML = rows || '<tr><td colspan="7">Nenhuma reserva encontrada.</td></tr>';

    document.querySelectorAll("[data-fill-reservation]").forEach((button) => {
      button.addEventListener("click", () => {
        fillLoanFormFromReservation(Number(button.dataset.fillReservation));
      });
    });
  }

  function fillLoanFormFromReservation(reservationId) {
    const reservation = pendingReservations.find((item) => item.id === reservationId);
    if (!reservation) {
      return;
    }

    // Quando a tela de retirada nao esta aberta, guardamos o contexto para continuar o fluxo na pagina certa.
    if (!document.getElementById("loanReservationId")) {
      sessionStorage.setItem(PREFILL_RESERVATION_KEY, String(reservationId));
      window.location.href = "adm-reservas.html";
      return;
    }

    document.getElementById("loanReservationId").value = reservation.id;
    document.getElementById("loanClientName").value = reservation.cliente?.nome || "";
    document.getElementById("loanBookTitle").value = reservation.livro?.titulo || "";
    document.getElementById("loanBookCategory").value = reservation.livro?.categoria || "";
    if (document.getElementById("loanStartDate")) {
      document.getElementById("loanStartDate").value = "Gerado na confirmação da retirada";
    }
    if (document.getElementById("loanDueDate")) {
      document.getElementById("loanDueDate").value = "Prazo padrão de 14 dias";
    }
    if (document.getElementById("loanHelperText")) {
      document.getElementById("loanHelperText").textContent = `Reserva #${reservation.id} pronta para registrar a retirada de ${reservation.cliente?.nome || "cliente"}.`;
    }
    if (document.getElementById("emprestimos")) {
      document.getElementById("emprestimos").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    document.getElementById("loanReservationId").focus();
  }

  function maybeApplyLoanReservationPrefill() {
    if (loanPrefillApplied || !document.getElementById("loanReservationId")) {
      return;
    }

    const storedReservationId = Number(sessionStorage.getItem(PREFILL_RESERVATION_KEY));
    if (!storedReservationId) {
      return;
    }

    loanPrefillApplied = true;
    sessionStorage.removeItem(PREFILL_RESERVATION_KEY);
    fillLoanFormFromReservation(storedReservationId);
  }

  function renderLoanTable(loans) {
    document.getElementById("loanTable").innerHTML = loans.map((loan) => `
      <tr>
        <td>${loan.id}</td>
        <td>${app.escapeHtml(loan.cliente.nome)}</td>
        <td>${app.escapeHtml(loan.livro.titulo)}</td>
        <td>${app.formatDate(loan.dataEmprestimo)}</td>
        <td>${app.formatDate(loan.dataDevolucaoPrevista)}</td>
        <td>${app.escapeHtml(loan.status)}</td>
        <td>${loan.renovado ? "Já renovado" : "Disponível"}</td>
        <td>
          ${loan.status === "ATIVO" && !loan.renovado
            ? `<button class="button ghost" type="button" data-renew-loan="${loan.id}">Renovar</button>`
            : '<span class="inline-status">Sem ação</span>'}
        </td>
      </tr>
    `).join("");

    document.querySelectorAll("[data-renew-loan]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await app.request(`/emprestimos/${button.dataset.renewLoan}/renovar`, { method: "PATCH" });
          loadDashboard();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  }

  function renderReturnHistory(returns) {
    const container = document.getElementById("returnHistory");
    if (!returns.length) {
      container.innerHTML = '<div class="status-item">Nenhuma devolução registrada no momento.</div>';
      return;
    }

    container.innerHTML = returns.map((returnItem) => `
      <div class="status-item">
        <strong>${app.escapeHtml(returnItem.cliente.nome)}</strong>
        <p>${app.escapeHtml(returnItem.livro.titulo)} - devolvido em ${app.formatDate(returnItem.dataDevolucao)} - ${app.escapeHtml(returnItem.estadoLivro || "BOM")}</p>
        ${returnItem.observacao ? `<p>${app.escapeHtml(returnItem.observacao)}</p>` : ""}
      </div>
    `).join("");
  }

  function renderLateList(loans) {
    const container = document.getElementById("lateList");
    if (!loans.length) {
      container.innerHTML = '<div class="status-item">Nenhum empréstimo atrasado no momento.</div>';
      return;
    }

    container.innerHTML = `
      <div class="status-row header">
        <span>ID. RESERVA</span>
        <span>CLIENTE</span>
        <span>LIVRO</span>
        <span>DT RESERVA</span>
        <span>PRAZO</span>
        <span>Status</span>
      </div>
      ${loans.map((loan) => `
        <div class="status-row item">
          <span>${loan.reservaId || loan.id}</span>
          <span>${app.escapeHtml(loan.cliente.nome)}</span>
          <span>${app.escapeHtml(loan.livro.titulo)}</span>
          <span>${app.formatDate(loan.dataEmprestimo)}</span>
          <span>${app.formatDate(loan.dataDevolucaoPrevista)}</span>
          <span class="status-badge overdue">${app.escapeHtml(loan.status)}</span>
        </div>
      `).join("")}
    `;
  }

  function renderUsers(users) {
    document.getElementById("userTable").innerHTML = users.map((user) => `
      <tr>
        <td><input type="radio" name="selectedUser" value="${user.id}"></td>
        <td>${user.id}</td>
        <td>${app.escapeHtml(user.nome)}</td>
        <td>${app.escapeHtml(user.cpf || "-")}</td>
        <td>${app.escapeHtml(user.email)}</td>
        <td>${app.escapeHtml(user.telefone)}</td>
      </tr>
    `).join("");
  }

  function renderBooks(books) {
    document.getElementById("bookTable").innerHTML = books.map((book) => `
      <tr>
        <td><input type="radio" name="selectedBook" value="${book.id}" ${selectedBookId === book.id ? "checked" : ""}></td>
        <td>${book.id}</td>
        <td>${app.escapeHtml(book.titulo)}</td>
        <td>${app.escapeHtml(book.autor)}</td>
        <td>${app.escapeHtml(book.categoria)}</td>
        <td><input class="table-stock-input" type="number" min="0" value="${book.quantidadeDisponivel}" data-stock-available="${book.id}" aria-label="Quantidade disponível do livro ${app.escapeHtml(book.titulo)}"></td>
        <td><input class="table-stock-input" type="number" min="1" value="${book.quantidadeTotal}" data-stock-total="${book.id}" aria-label="Quantidade total do livro ${app.escapeHtml(book.titulo)}"></td>
        <td>${app.escapeHtml(book.status)}</td>
        <td><button class="button primary small table-stock-action" type="button" data-save-stock="${book.id}">Salvar</button></td>
      </tr>
    `).join("");

    document.querySelectorAll('input[name="selectedBook"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        selectedBookId = Number(radio.value);
        fillBookForm(books.find((book) => book.id === selectedBookId));
      });
    });

    document.querySelectorAll("[data-save-stock]").forEach((button) => {
      button.addEventListener("click", () => {
        updateBookStock(Number(button.dataset.saveStock));
      });
    });
  }

  async function updateBookStock(bookId) {
    const book = cachedBooks.find((item) => item.id === bookId);
    if (!book) {
      alert("Livro não encontrado para atualizar o estoque.");
      return;
    }

    const availableInput = document.querySelector(`[data-stock-available="${bookId}"]`);
    const totalInput = document.querySelector(`[data-stock-total="${bookId}"]`);
    const available = Number(availableInput?.value);
    const total = Number(totalInput?.value);

    if (!Number.isInteger(total) || total < 1) {
      alert("A quantidade total deve ser pelo menos 1.");
      return;
    }

    if (!Number.isInteger(available) || available < 0) {
      alert("A quantidade disponível não pode ser negativa.");
      return;
    }

    if (available > total) {
      alert("A quantidade disponível não pode ser maior que a quantidade total.");
      return;
    }

    const payload = {
      // O endpoint de livro faz update completo, entao reenviamos os campos ja existentes junto do estoque.
      titulo: book.titulo,
      autor: book.autor,
      categoria: book.categoria,
      quantidadeTotal: total,
      quantidadeDisponivel: available,
      imagemUrl: book.imagemUrl,
      descricao: book.descricao
    };

    try {
      await app.request(`/livros/${bookId}`, { method: "PUT", body: payload });
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  function filterUsers() {
    if (!document.getElementById("userSearchInput")) return;
    const term = document.getElementById("userSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedUsers
      : cachedUsers.filter((user) => [user.nome, user.email, user.cpf, user.telefone].some((value) => String(value || "").toLowerCase().includes(term)));
    renderUsers(filtered);
  }

  function filterBooks() {
    if (!document.getElementById("bookSearchInput")) return;
    const term = document.getElementById("bookSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedBooks
      : cachedBooks.filter((book) => [book.titulo, book.autor, book.categoria, book.status].some((value) => String(value || "").toLowerCase().includes(term)));
    renderBooks(filtered);
  }

  function filterLateLoans() {
    if (!document.getElementById("lateSearchInput")) return;
    const term = document.getElementById("lateSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedLateLoans
      : cachedLateLoans.filter((loan) => [loan.id, loan.reservaId, loan.cliente.nome, loan.livro.titulo].some((value) => String(value || "").toLowerCase().includes(term)));
    renderLateList(filtered);
  }

  function fillBookForm(book) {
    if (!book || !document.getElementById("bookId")) {
      return;
    }
    document.getElementById("bookId").value = book.id;
    document.getElementById("bookDisplayId").value = book.id;
    document.getElementById("bookTitle").value = book.titulo;
    document.getElementById("bookAuthor").value = book.autor;
    document.getElementById("bookCategory").value = book.categoria;
    document.getElementById("bookTotal").value = book.quantidadeTotal;
    document.getElementById("bookAvailable").value = book.quantidadeDisponivel;
    document.getElementById("bookImage").value = book.imagemUrl;
    document.getElementById("bookDescription").value = book.descricao;
    if (document.getElementById("gestao")) {
      document.getElementById("gestao").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function focusSelectedBook() {
    if (!selectedBookId) {
      alert("Selecione um livro na tabela para editar.");
      return;
    }
    if (!document.getElementById("bookForm")) {
      sessionStorage.setItem(EDIT_BOOK_KEY, String(selectedBookId));
      window.location.href = "adm-livros.html";
      return;
    }
    if (document.getElementById("gestao")) {
      document.getElementById("gestao").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (document.getElementById("bookTitle")) {
      document.getElementById("bookTitle").focus();
    }
  }

  function maybeApplyBookSelectionPrefill() {
    if (bookPrefillApplied || !document.getElementById("bookForm")) {
      return;
    }

    const storedBookId = Number(sessionStorage.getItem(EDIT_BOOK_KEY));
    if (!storedBookId) {
      return;
    }

    const book = cachedBooks.find((item) => item.id === storedBookId);
    if (!book) {
      sessionStorage.removeItem(EDIT_BOOK_KEY);
      return;
    }

    bookPrefillApplied = true;
    selectedBookId = storedBookId;
    sessionStorage.removeItem(EDIT_BOOK_KEY);
    // Reaproveita a selecao feita na tabela quando o usuario e redirecionado para a pagina de edicao.
    fillBookForm(book);
  }

  async function submitLoanForm(event) {
    event.preventDefault();
    try {
      await app.request("/emprestimos/confirmar-retirada", {
        method: "POST",
        body: {
          reservaId: Number(document.getElementById("loanReservationId").value),
          administradorId: Number(document.getElementById("loanAdminId").value)
        }
      });
      event.target.reset();
      if (document.getElementById("loanAdminId")) {
        document.getElementById("loanAdminId").value = 1;
      }
      if (document.getElementById("loanClientName")) {
        document.getElementById("loanClientName").value = "";
      }
      if (document.getElementById("loanBookTitle")) {
        document.getElementById("loanBookTitle").value = "";
      }
      if (document.getElementById("loanBookCategory")) {
        document.getElementById("loanBookCategory").value = "";
      }
      if (document.getElementById("loanStartDate")) {
        document.getElementById("loanStartDate").value = "Automática na confirmação";
      }
      if (document.getElementById("loanDueDate")) {
        document.getElementById("loanDueDate").value = "Prazo padrão de 14 dias";
      }
      if (document.getElementById("loanHelperText")) {
        document.getElementById("loanHelperText").textContent = "Empréstimo / retirada registrado com sucesso.";
      }
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  async function submitReturnForm(event) {
    event.preventDefault();
    try {
      await app.request("/emprestimos/devolucoes", {
        method: "POST",
        body: {
          emprestimoId: Number(document.getElementById("returnLoanId").value),
          administradorId: Number(document.getElementById("returnAdminId").value),
          estadoLivro: document.getElementById("returnBookState").value,
          observacao: document.getElementById("returnObservation")?.value.trim() || ""
        }
      });
      event.target.reset();
      if (document.getElementById("returnAdminId")) {
        document.getElementById("returnAdminId").value = 1;
      }
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  async function submitBookForm(event) {
    event.preventDefault();
    const total = Number(document.getElementById("bookTotal").value);
    const available = Number(document.getElementById("bookAvailable").value);

    if (available > total) {
      alert("A quantidade disponível não pode ser maior que a quantidade total.");
      return;
    }

    const payload = {
      titulo: document.getElementById("bookTitle").value.trim(),
      autor: document.getElementById("bookAuthor").value.trim(),
      categoria: document.getElementById("bookCategory").value.trim(),
      quantidadeTotal: total,
      quantidadeDisponivel: available,
      imagemUrl: document.getElementById("bookImage").value.trim(),
      descricao: document.getElementById("bookDescription").value.trim()
    };

    const id = document.getElementById("bookId").value;
    try {
      if (id) {
        await app.request(`/livros/${id}`, { method: "PUT", body: payload });
      } else {
        await app.request("/livros", { method: "POST", body: payload });
      }

      event.target.reset();
      selectedBookId = null;
      if (document.getElementById("bookDisplayId")) {
        document.getElementById("bookDisplayId").value = "";
      }
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteSelectedBook() {
    if (!selectedBookId) {
      alert("Selecione um livro na tabela para excluir.");
      return;
    }
    try {
      await app.request(`/livros/${selectedBookId}`, { method: "DELETE" });
      if (document.getElementById("bookForm")) {
        document.getElementById("bookForm").reset();
      }
      selectedBookId = null;
      if (document.getElementById("bookDisplayId")) {
        document.getElementById("bookDisplayId").value = "";
      }
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  function bindAdminLoginForm() {
    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const login = document.getElementById("adminLogin").value.trim().toLowerCase();
      const password = document.getElementById("adminPassword").value;
      const feedback = document.getElementById("adminLoginFeedback");

      try {
        const admin = await app.request("/administracao/login", {
          method: "POST",
          body: {
            email: login,
            senha: password
          }
        });
        sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(admin));
        window.location.href = "adm.html";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function ensureAdminAuth() {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY)) {
      return true;
    }

    window.location.href = "adm-login.html";
    return false;
  }

  function renderAdminLogout() {
    const sidebar = document.querySelector(".sidebar-user");
    if (!sidebar || document.getElementById("adminLogoutButton")) return;

    sidebar.insertAdjacentHTML("beforeend", '<button class="admin-logout" id="adminLogoutButton" type="button">Sair</button>');
    document.getElementById("adminLogoutButton").addEventListener("click", () => {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      window.location.href = "adm-login.html";
    });
  }
})();
