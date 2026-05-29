(function () {
  const app = window.TechBookApp;
  const PREFILL_RESERVATION_KEY = "techbook.admin.prefillReservationId";
  const PREFILL_RETURN_LOAN_KEY = "techbook.admin.prefillReturnLoanId";
  const EDIT_BOOK_KEY = "techbook.admin.editBookId";
  const ADMIN_AUTH_KEY = "techbook-admin-auth";
  let selectedBookId = null;
  let pendingReservations = [];
  let cachedLoans = [];
  let cachedReturns = [];
  let cachedUsers = [];
  let cachedBooks = [];
  let cachedLateLoans = [];
  let filteredBooks = [];
  let bookCurrentPage = 1;
  let bookPageSize = 20;
  let filteredUsers = [];
  let userCurrentPage = 1;
  let userPageSize = 12;
  let filteredLoans = [];
  let loanCurrentPage = 1;
  let loanPageSize = 12;
  let filteredLateLoans = [];
  let lateCurrentPage = 1;
  let latePageSize = 10;
  let filteredReturnHistory = [];
  let returnHistoryCurrentPage = 1;
  let returnHistoryPageSize = 5;
  let pendingLateLoanAction = null;
  let selectedReservationId = null;
  let selectedReturnLoanId = null;
  let loanPrefillApplied = false;
  let returnPrefillApplied = false;
  let bookPrefillApplied = false;

  if (document.body.dataset.page === "admin-login") {
    bindAdminLoginForm();
    return;
  }

  if (!ensureAdminAuth()) {
    return;
  }

  renderAdminLogout();
  ensureAdminToast();
  normalizeAdminNavigation();
  bindIfPresent("refreshDashboard", "click", loadDashboard);
  bindIfPresent("loanForm", "submit", submitLoanForm);
  bindIfPresent("returnForm", "submit", submitReturnForm);
  bindIfPresent("bookForm", "submit", submitBookForm);
  bindIfPresent("deleteBookButton", "click", deleteSelectedBook);
  bindIfPresent("editBookButton", "click", focusSelectedBook);
  bindIfPresent("deleteBookInModalButton", "click", deleteBookFromModal);
  bindIfPresent("clearBookFormButton", "click", clearBookForm);
  bindIfPresent("newBookButton", "click", openNewBookModal);
  bindIfPresent("closeBookModalButton", "click", closeBookModal);
  bindIfPresent("closeLoanModalButton", "click", closeLoanModal);
  bindIfPresent("cancelLoanModalButton", "click", closeLoanModal);
  bindIfPresent("bookSearchButton", "click", filterBooks);
  bindIfPresent("bookSearchInput", "input", () => filterBooks(true));
  bindIfPresent("bookCategoryFilter", "change", () => filterBooks(true));
  bindIfPresent("bookPageSize", "change", handleBookPageSizeChange);
  bindIfPresent("userSearchButton", "click", filterUsers);
  bindIfPresent("userSearchInput", "input", () => filterUsers(true));
  bindIfPresent("userStatusFilter", "change", () => filterUsers(true));
  bindIfPresent("lateSearchButton", "click", filterLateLoans);
  bindIfPresent("lateSearchInput", "input", () => filterLateLoans(true));
  bindIfPresent("lateStatusFilter", "change", () => filterLateLoans(true));
  bindIfPresent("latePageSize", "change", handleLatePageSizeChange);
  bindIfPresent("loanSearchButton", "click", filterLoans);
  bindIfPresent("loanSearchInput", "input", () => filterLoans(true));
  bindIfPresent("loanStatusFilter", "change", () => filterLoans(true));
  bindIfPresent("loanPageSize", "change", handleLoanPageSizeChange);
  bindIfPresent("contactModalForm", "submit", submitContactModal);
  bindIfPresent("lostModalForm", "submit", submitLostModal);
  bindIfPresent("closeContactModalButton", "click", closeLateActionModals);
  bindIfPresent("cancelContactModalButton", "click", closeLateActionModals);
  bindIfPresent("closeLostModalButton", "click", closeLateActionModals);
  bindIfPresent("cancelLostModalButton", "click", closeLateActionModals);
  bindIfPresent("closeUserHistoryButton", "click", closeUserHistoryModal);
  bindIfPresent("returnSearchButton", "click", () => filterReturnHistory(true));
  bindIfPresent("returnSearchInput", "input", () => filterReturnHistory(true));
  bindIfPresent("returnHistoryStateFilter", "change", () => filterReturnHistory(true));
  bindIfPresent("returnHistoryMonthFilter", "change", () => filterReturnHistory(true));
  bindIfPresent("returnHistoryYearFilter", "change", () => filterReturnHistory(true));
  bindIfPresent("returnHistoryPageSize", "change", handleReturnHistoryPageSizeChange);
  bindIfPresent("reservationSearchInput", "input", filterReservations);
  bindIfPresent("reservationSearchButton", "click", filterReservations);
  bindIfPresent("returnLoanSearchInput", "input", filterReturnLoanPicker);
  bindIfPresent("returnLoanStatusFilter", "change", filterReturnLoanPicker);
  document.getElementById("bookModal")?.addEventListener("click", (event) => {
    if (event.target.id === "bookModal") {
      closeBookModal();
    }
  });
  document.getElementById("loanModal")?.addEventListener("click", (event) => {
    if (event.target.id === "loanModal") {
      closeLoanModal();
    }
  });
  document.getElementById("contactModal")?.addEventListener("click", (event) => {
    if (event.target.id === "contactModal") {
      closeLateActionModals();
    }
  });
  document.getElementById("lostModal")?.addEventListener("click", (event) => {
    if (event.target.id === "lostModal") {
      closeLateActionModals();
    }
  });
  document.getElementById("userHistoryModal")?.addEventListener("click", (event) => {
    if (event.target.id === "userHistoryModal") {
      closeUserHistoryModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("bookModal")?.hidden) {
      closeBookModal();
    }
    if (event.key === "Escape" && !document.getElementById("loanModal")?.hidden) {
      closeLoanModal();
    }
    if (event.key === "Escape" && (!document.getElementById("contactModal")?.hidden || !document.getElementById("lostModal")?.hidden)) {
      closeLateActionModals();
    }
    if (event.key === "Escape" && !document.getElementById("userHistoryModal")?.hidden) {
      closeUserHistoryModal();
    }
  });
  window.addEventListener("hashchange", maybeOpenBookModalFromHash);

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

  function renderDashboardInsights(books, reservations, loans, users, returns) {
    renderTopReservedBooks(reservations);
    renderMostWantedBooks(books, reservations, loans);
    renderShortageRiskList(books, reservations, loans);
    renderCategoryDashboard(books, reservations, loans);
    renderManagementAlerts(books, reservations, loans);
    renderRecentActivity(reservations, loans, returns);
  }

  function updateSmartDashboardMetrics(books, reservations, loans, users) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingReservations = reservations.filter((item) => item.status === "PENDENTE");
    const dueToday = pendingReservations.filter((item) => daysUntil(item.prazoRetirada, today) === 0).length;
    const overdueLoans = loans.filter((loan) => loan.status === "ATRASADO").length;
    const lostLoans = loans.filter((loan) => loan.status === "EXTRAVIADO").length;
    const blockedUsers = users.filter((user) => user.bloqueado).length;
    const shortageRisk = calculateShortageRisk(books, reservations, loans).length;
    const pickupRate = calculatePickupRate(reservations, loans);

    setTextIfPresent("metricTodayAttention", dueToday + overdueLoans);
    setTextIfPresent("metricShortageRisk", shortageRisk);
    setTextIfPresent("metricCriticalIssues", overdueLoans + lostLoans + blockedUsers);
    setTextIfPresent("metricPickupRate", `${pickupRate}%`);
  }

  function renderTopReservedBooks(reservations) {
    const container = document.getElementById("topReservedList");
    if (!container) return;

    const ranking = Object.values(reservations.reduce((acc, reservation) => {
      const title = reservation.livro?.titulo || "Livro sem título";
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

  function renderMostWantedBooks(books, reservations, loans) {
    const container = document.getElementById("mostWantedList");
    if (!container) return;

    const demand = calculateBookDemand(books, reservations, loans)
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (!demand.length) {
      container.innerHTML = '<p class="empty-insight">Ainda não existe histórico suficiente de procura.</p>';
      return;
    }

    container.innerHTML = demand.map((item, index) => `
      <div class="rank-item smart-rank">
        <span class="rank-position">${index + 1}</span>
        <span class="rank-title">${app.escapeHtml(item.title)}</span>
        <span class="rank-count">${item.score} ponto${item.score === 1 ? "" : "s"}</span>
        <small>${item.reservations} reserva${item.reservations === 1 ? "" : "s"} · ${item.loans} empréstimo${item.loans === 1 ? "" : "s"}</small>
      </div>
    `).join("");
  }

  function renderShortageRiskList(books, reservations, loans) {
    const container = document.getElementById("shortageRiskList");
    if (!container) return;

    const risks = calculateShortageRisk(books, reservations, loans).slice(0, 4);

    if (!risks.length) {
      container.innerHTML = '<p class="empty-insight">Nenhum livro em risco de falta agora.</p>';
      return;
    }

    container.innerHTML = risks.map((item, index) => `
      <div class="rank-item risk-item">
        <span class="rank-position">${index + 1}</span>
        <span class="rank-title">${app.escapeHtml(item.title)}</span>
        <span class="rank-count">${item.available} livre${item.available === 1 ? "" : "s"}</span>
        <small>${item.demand} movimentaç${item.demand === 1 ? "ão" : "ões"} recentes</small>
      </div>
    `).join("");
  }

  function renderCategoryDashboard(books, reservations = [], loans = []) {
    const container = document.getElementById("categoryDashboardList");
    if (!container) return;

    const demandByBook = calculateBookDemand(books, reservations, loans).reduce((acc, item) => {
      acc[item.id] = item.score;
      return acc;
    }, {});

    const categories = Object.values(books.reduce((acc, book) => {
      const category = book.categoria || "Sem categoria";
      acc[category] = acc[category] || { category, total: 0, available: 0, demand: 0 };
      acc[category].total += 1;
      acc[category].available += Number(book.quantidadeDisponivel || 0);
      acc[category].demand += demandByBook[book.id] || 0;
      return acc;
    }, {}))
      .sort((a, b) => b.demand - a.demand || b.total - a.total)
      .slice(0, 4);

    if (!categories.length) {
      container.innerHTML = '<p class="empty-insight">Cadastre livros para visualizar as categorias.</p>';
      return;
    }

    const maxDemand = Math.max(...categories.map((item) => item.demand || item.total), 1);
    container.innerHTML = categories.map((item, index) => {
      const width = Math.max(12, Math.round(((item.demand || item.total) / maxDemand) * 100));
      return `
        <div class="category-item category-chart-item" style="--bar-width: ${width}%; --bar-index: ${index};">
          <div class="category-chart-head">
            <span class="category-title">${app.escapeHtml(item.category)}</span>
            <strong>${item.demand} reserva${item.demand === 1 ? "" : "s"} e empréstimo${item.demand === 1 ? "" : "s"}</strong>
          </div>
          <div class="category-bar"><span></span></div>
          <div class="category-meta">
            <span>Reservas e empréstimos</span>
            <span>${item.available} ${item.available === 1 ? "disponível" : "disponíveis"}</span>
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
        title: "Retiradas próximas do prazo",
        detail: `${dueSoon} reserva${dueSoon === 1 ? "" : "s"} vence${dueSoon === 1 ? "" : "m"} nos próximos 2 dias.`,
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
        title: "Empréstimos atrasados",
        detail: `${overdueLoans} devolução${overdueLoans === 1 ? "" : "ões"} pendente${overdueLoans === 1 ? "" : "s"}.`,
        type: "warning",
        href: "adm-atrasos.html"
      });
    }

    if (!alerts.length) {
      alerts.push({
        title: "Fila sob controle",
        detail: pendingReservations || unavailableBooks
          ? "Sem urgencia para hoje. Acompanhe reservas e estoque normalmente."
          : "Sem pendências críticas no momento.",
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

  function renderRecentActivity(reservations, loans, returns) {
    const container = document.getElementById("recentActivityList");
    if (!container) return;

    const activities = [
      ...reservations.map((item) => ({
        date: item.dataReserva,
        type: "Reserva",
        title: item.livro?.titulo || "Livro sem título",
        detail: item.cliente?.nome || "Cliente"
      })),
      ...loans.map((item) => ({
        date: item.dataEmprestimo,
        type: "Retirada",
        title: item.livro?.titulo || "Livro sem título",
        detail: item.cliente?.nome || "Cliente"
      })),
      ...returns.map((item) => ({
        date: item.dataDevolucao,
        type: "Devolução",
        title: item.livro?.titulo || "Livro sem título",
        detail: item.estadoLivro === "AVARIADO" ? "Com avaria" : "Bom estado"
      }))
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`))
      .slice(0, 5);

    if (!activities.length) {
      container.innerHTML = '<p class="empty-insight">Nenhuma atividade recente registrada.</p>';
      return;
    }

    container.innerHTML = activities.map((item) => `
      <div class="timeline-item">
        <span>${app.escapeHtml(item.type)}</span>
        <strong>${app.escapeHtml(item.title)}</strong>
        <small>${app.escapeHtml(item.detail)} · ${app.formatDate(item.date)}</small>
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
        title: book.titulo || "Livro sem título",
        available: Number(book.quantidadeDisponivel || 0),
        reservations: pendingCounts[book.id] || 0
      }))
      .filter((item) => item.reservations >= 2 && item.available <= 1)
      .sort((a, b) => b.reservations - a.reservations)[0];
  }

  function calculateBookDemand(books, reservations, loans) {
    const demand = books.reduce((acc, book) => {
      acc[book.id] = {
        id: book.id,
        title: book.titulo || "Livro sem título",
        available: Number(book.quantidadeDisponivel || 0),
        total: Number(book.quantidadeTotal || 0),
        reservations: 0,
        loans: 0,
        score: 0
      };
      return acc;
    }, {});

    reservations.forEach((reservation) => {
      const bookId = reservation.livro?.id || reservation.livroId;
      if (!bookId) return;
      demand[bookId] = demand[bookId] || {
        id: bookId,
        title: reservation.livro?.titulo || "Livro sem título",
        available: 0,
        total: 0,
        reservations: 0,
        loans: 0,
        score: 0
      };
      demand[bookId].reservations += 1;
      demand[bookId].score += reservation.status === "PENDENTE" ? 3 : 1;
    });

    loans.forEach((loan) => {
      const bookId = loan.livro?.id || loan.livroId;
      if (!bookId) return;
      demand[bookId] = demand[bookId] || {
        id: bookId,
        title: loan.livro?.titulo || "Livro sem título",
        available: 0,
        total: 0,
        reservations: 0,
        loans: 0,
        score: 0
      };
      demand[bookId].loans += 1;
      demand[bookId].score += ["ATIVO", "ATRASADO"].includes(loan.status) ? 2 : 1;
    });

    return Object.values(demand);
  }

  function calculateShortageRisk(books, reservations, loans) {
    return calculateBookDemand(books, reservations, loans)
      .map((item) => ({
        ...item,
        demand: item.reservations + item.loans,
        pressure: item.score - item.available
      }))
      .filter((item) => item.demand > 0 && item.available <= 2)
      .sort((a, b) => b.pressure - a.pressure);
  }

  function calculatePickupRate(reservations, loans) {
    if (!reservations.length) return 0;
    const confirmedReservationIds = new Set(loans.map((loan) => loan.reservaId).filter(Boolean));
    return Math.round((confirmedReservationIds.size / reservations.length) * 100);
  }

  async function loadDashboard() {
    const needsDashboard = Boolean(document.getElementById("metricBooks") || document.getElementById("topReservedList"));
    const needsReservations = needsDashboard || Boolean(document.getElementById("reservationTable") || document.getElementById("userTable"));
    const needsLoans = needsDashboard || Boolean(document.getElementById("loanTable") || document.getElementById("returnLoanList") || document.getElementById("lateList") || document.getElementById("userTable"));
    const needsUsers = needsDashboard || Boolean(document.getElementById("userTable"));
    const needsBooks = needsDashboard || Boolean(document.getElementById("bookTable"));
    const needsReturns = needsDashboard || Boolean(document.getElementById("returnHistory") || document.getElementById("userTable"));

    try {
      const [dashboard, loans, users, books, reservations, returns] = await Promise.all([
        needsDashboard ? app.request("/administracao/dashboard") : Promise.resolve(null),
        needsLoans ? app.request("/emprestimos") : Promise.resolve(cachedLoans),
        needsUsers ? app.request("/clientes") : Promise.resolve(cachedUsers),
        needsBooks ? app.request("/livros") : Promise.resolve(cachedBooks),
        needsReservations ? app.request("/reservas") : Promise.resolve(pendingReservations),
        needsReturns ? app.request("/emprestimos/devolucoes") : Promise.resolve(cachedReturns)
      ]);

      pendingReservations = reservations || [];
      cachedLoans = loans || [];
      cachedReturns = returns || [];
      cachedUsers = users || [];
      cachedBooks = books || [];
      cachedLateLoans = cachedLoans.filter((loan) => ["ATRASADO", "EXTRAVIADO"].includes(loan.status));

      maybeApplyLoanReservationPrefill();
      maybeApplyReturnLoanPrefill(cachedLoans);
      maybeApplyBookSelectionPrefill();

      if (dashboard) {
        setTextIfPresent("metricBooks", dashboard.totalLivros);
        setTextIfPresent("metricLoans", dashboard.emprestimosAtivos);
        setTextIfPresent("metricLate", dashboard.atrasados);
        setTextIfPresent("metricUsers", dashboard.usuarios);
        setTextIfPresent("metricReservations", dashboard.reservasPendentes);
        setTextIfPresent("metricAvailableBooks", dashboard.livrosDisponiveis);
        setTextIfPresent("metricUnavailableBooks", dashboard.livrosIndisponiveis);
        updateSmartDashboardMetrics(cachedBooks, pendingReservations, cachedLoans, cachedUsers);
        renderDashboardInsights(cachedBooks, pendingReservations, cachedLoans, cachedUsers, cachedReturns);
      }

      if (document.getElementById("reservationTable")) {
        renderReservationSummary(pendingReservations);
        filterReservations();
      }
      if (document.getElementById("loanTable")) {
        filterLoans();
      }
      if (document.getElementById("returnLoanList")) {
        filterReturnLoanPicker();
      }
      if (document.getElementById("returnHistory")) {
        renderReturnHistoryPeriodOptions(cachedReturns);
        filterReturnHistory(true);
      }
      if (document.getElementById("lateList")) {
        filterLateLoans();
      }
      if (document.getElementById("userTable")) {
        filterUsers();
      }
      if (document.getElementById("bookTable")) {
        renderBookCategoryOptions(cachedBooks);
        filterBooks();
        maybeOpenBookModalFromHash();
      }
    } catch (error) {
      renderDashboardUnavailable(error.message);
    }
  }

  function renderDashboardUnavailable(message) {
    ["metricBooks", "metricLoans", "metricLate", "metricUsers", "metricReservations", "metricAvailableBooks", "metricUnavailableBooks", "metricTodayAttention", "metricShortageRisk", "metricCriticalIssues", "metricPickupRate"]
      .forEach((id) => setTextIfPresent(id, "-"));

    ["topReservedList", "mostWantedList", "shortageRiskList", "categoryDashboardList", "managementAlerts", "recentActivityList"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = `<p class="empty-insight">${app.escapeHtml(message)}</p>`;
      }
    });

    if (document.getElementById("reservationTable")) {
      document.getElementById("reservationTable").innerHTML = `<tr><td colspan="7">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("loanTable")) {
      document.getElementById("loanTable").innerHTML = `<tr><td colspan="8">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("returnHistory")) {
      document.getElementById("returnHistory").innerHTML = `<div class="status-item">${app.escapeHtml(message)}</div>`;
    }
    if (document.getElementById("returnLoanList")) {
      document.getElementById("returnLoanList").innerHTML = `<div class="status-item">${app.escapeHtml(message)}</div>`;
    }
    if (document.getElementById("lateList")) {
      document.getElementById("lateList").innerHTML = `<div class="status-item">${app.escapeHtml(message)}</div>`;
    }
    if (document.getElementById("userTable")) {
      document.getElementById("userTable").innerHTML = `<tr><td colspan="7">${app.escapeHtml(message)}</td></tr>`;
    }
    if (document.getElementById("bookTable")) {
      document.getElementById("bookTable").innerHTML = `<tr><td colspan="9">${app.escapeHtml(message)}</td></tr>`;
    }
  }

  function ensureAdminToast() {
    if (document.getElementById("adminToast")) {
      return;
    }

    document.body.insertAdjacentHTML("beforeend", '<div class="admin-toast" id="adminToast" role="status" aria-live="polite"></div>');
  }

  function notify(message, type = "success") {
    const toast = document.getElementById("adminToast");
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.className = `admin-toast ${type} visible`;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
      toast.classList.remove("visible");
    }, 3600);
  }

  function statusBadge(status) {
    const normalized = String(status || "").toUpperCase();
    const labels = {
      PENDENTE: "Pendente",
      ATIVO: "Ativo",
      ATRASADO: "Atrasado",
      DEVOLVIDO: "Devolvido",
      EXTRAVIADO: "Extraviado",
      DISPONIVEL: "Disponível",
      INDISPONIVEL: "Indisponível",
      BLOQUEADO: "Bloqueado",
      LIBERADO: "Liberado",
      CANCELADA: "Cancelada",
      EXPIRADA: "Expirada",
      RETIRADA_CONFIRMADA: "Retirada confirmada"
    };
    const tone = ["ATRASADO", "EXTRAVIADO", "BLOQUEADO"].includes(normalized)
      ? "overdue"
      : normalized === "ATIVO"
        ? "active"
        : ["PENDENTE", "RETIRADA_CONFIRMADA", "DISPONIVEL", "LIBERADO"].includes(normalized)
          ? "success"
          : ["CANCELADA", "EXPIRADA", "INDISPONIVEL"].includes(normalized)
            ? "warning"
            : "neutral";

    return `<span class="status-badge ${tone}">${app.escapeHtml(labels[normalized] || normalized || "-")}</span>`;
  }

  function renderReservationTable(reservations) {
    const pending = reservations
      .filter((reservation) => reservation.status === "PENDENTE")
      .sort((a, b) => b.id - a.id);

    const rows = pending.map((reservation) => `
        <tr class="${selectedReservationId === reservation.id ? "selected-row" : ""}">
          <td>${reservation.id}</td>
          <td>${app.escapeHtml(reservation.cliente.nome)}</td>
          <td>${app.escapeHtml(reservation.livro.titulo)}</td>
          <td>${app.formatDate(reservation.dataReserva)}</td>
          <td>${app.formatDate(reservation.prazoRetirada)}</td>
          <td>${statusBadge(reservation.status)}</td>
          <td><button class="button primary small" type="button" data-fill-reservation="${reservation.id}">Selecionar reserva</button></td>
        </tr>
      `).join("");

    document.getElementById("reservationTable").innerHTML = rows || '<tr><td colspan="7">Nenhuma reserva pendente para retirada.</td></tr>';

    document.querySelectorAll("[data-fill-reservation]").forEach((button) => {
      button.addEventListener("click", () => {
        fillLoanFormFromReservation(Number(button.dataset.fillReservation));
      });
    });
  }

  function renderReservationSummary(reservations) {
    const container = document.getElementById("reservationSummary");
    if (!container) return;

    const pending = reservations.filter((reservation) => reservation.status === "PENDENTE").length;
    const today = new Date();
    const dueToday = reservations.filter((reservation) => {
      if (reservation.status !== "PENDENTE" || !reservation.prazoRetirada) return false;
      return daysUntil(reservation.prazoRetirada, today) === 0;
    }).length;
    const expired = reservations.filter((reservation) => ["CANCELADA", "EXPIRADA"].includes(reservation.status)).length;

    container.innerHTML = `
      <span><strong>${pending}</strong> pendentes</span>
      <span><strong>${dueToday}</strong> vencem hoje</span>
      <span><strong>${expired}</strong> encerradas</span>
    `;
  }

  function filterReservations() {
    if (!document.getElementById("reservationTable")) return;

    const term = (document.getElementById("reservationSearchInput")?.value || "").trim().toLowerCase();
    const filtered = pendingReservations.filter((reservation) => {
      const matchesPending = reservation.status === "PENDENTE";
      const matchesTerm = !term || [reservation.id, reservation.cliente?.nome, reservation.livro?.titulo, reservation.livro?.categoria]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesPending && matchesTerm;
    });
    renderReservationTable(filtered);
  }

  function fillLoanFormFromReservation(reservationId) {
    const reservation = pendingReservations.find((item) => item.id === reservationId);
    if (!reservation) {
      return;
    }

    // Quando a tela de retirada não está aberta, guardamos o contexto para continuar o fluxo na página certa.
    if (!document.getElementById("loanReservationId")) {
      sessionStorage.setItem(PREFILL_RESERVATION_KEY, String(reservationId));
      window.location.href = "adm-reservas.html";
      return;
    }

    selectedReservationId = reservation.id;
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
    if (document.getElementById("loanSubmitButton")) {
      document.getElementById("loanSubmitButton").disabled = false;
    }
    renderSelectedReservationCard(reservation);
    filterReservations();
    openLoanModal();
  }

  function renderSelectedReservationCard(reservation) {
    const container = document.getElementById("selectedReservationCard");
    if (!container) return;

    const days = daysUntil(reservation.prazoRetirada, new Date());
    const deadlineText = days === null
      ? "Prazo não informado"
      : days < 0
        ? "Prazo vencido"
        : days === 0
          ? "Retirada vence hoje"
          : `${days} dia${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}`;

    container.innerHTML = `
      <div>
        <span class="selection-kicker">Reserva selecionada</span>
        <strong>#${reservation.id} - ${app.escapeHtml(reservation.cliente?.nome || "")}</strong>
        <p>${app.escapeHtml(reservation.livro?.titulo || "")}</p>
      </div>
      <div class="selection-meta">
        <span>${app.escapeHtml(deadlineText)}</span>
        <span>Prazo ${app.formatDate(reservation.prazoRetirada)}</span>
      </div>
    `;
    container.hidden = false;
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

  function openLoanModal() {
    const modal = document.getElementById("loanModal");
    if (!modal) return;

    modal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(() => document.getElementById("loanSubmitButton")?.focus(), 0);
  }

  function closeLoanModal() {
    const modal = document.getElementById("loanModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function renderLoanTable(loans) {
    const activeLoans = loans
      .filter((loan) => loan.status !== "DEVOLVIDO")
      .sort((a, b) => b.id - a.id);
    filteredLoans = activeLoans;
    const totalPages = Math.max(1, Math.ceil(filteredLoans.length / loanPageSize));
    if (loanCurrentPage > totalPages) {
      loanCurrentPage = totalPages;
    }
    const start = (loanCurrentPage - 1) * loanPageSize;
    const pageLoans = filteredLoans.slice(start, start + loanPageSize);

    if (!activeLoans.length) {
      document.getElementById("loanTable").innerHTML = '<tr><td colspan="8">Nenhum empréstimo ativo no momento.</td></tr>';
      renderSimplePagination("loanPagination", 0, 1, 1, () => {});
      return;
    }

    document.getElementById("loanTable").innerHTML = pageLoans.map((loan) => `
      <tr>
        <td>${loan.id}</td>
        <td>${app.escapeHtml(loan.cliente.nome)}</td>
        <td>${app.escapeHtml(loan.livro.titulo)}</td>
        <td>${app.formatDate(loan.dataEmprestimo)}</td>
        <td>${app.formatDate(loan.dataDevolucaoPrevista)}</td>
        <td>${statusBadge(loan.status)}</td>
        <td>${loan.renovado ? "Já renovado" : "Disponível"}</td>
        <td>${loanActions(loan)}</td>
      </tr>
    `).join("");
    renderSimplePagination("loanPagination", filteredLoans.length, loanCurrentPage, totalPages, (page) => {
      loanCurrentPage = page;
      renderLoanTable(filteredLoans);
    });

    document.querySelectorAll("[data-renew-loan]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await app.request(`/emprestimos/${button.dataset.renewLoan}/renovar`, { method: "PATCH" });
          loadDashboard();
        } catch (error) {
          notify(error.message, "error");
        }
      });
    });
    document.querySelectorAll("[data-return-loan]").forEach((button) => {
      button.addEventListener("click", () => {
        sessionStorage.setItem(PREFILL_RETURN_LOAN_KEY, button.dataset.returnLoan);
        window.location.href = "adm-devolucao.html";
      });
    });
  }

  function renderLoanSummary(loans) {
    const container = document.getElementById("loanSummary");
    if (!container) {
      return;
    }

    const active = loans.filter((loan) => loan.status === "ATIVO").length;
    const late = loans.filter((loan) => loan.status === "ATRASADO").length;
    const lost = loans.filter((loan) => loan.status === "EXTRAVIADO").length;
    const renewable = loans.filter((loan) => loan.status === "ATIVO" && !loan.renovado).length;

    container.innerHTML = `
      <span><strong>${active}</strong> ativos</span>
      <span><strong>${late}</strong> atrasados</span>
      <span><strong>${lost}</strong> extraviados</span>
      <span><strong>${renewable}</strong> podem renovar</span>
    `;
  }

  function loanActions(loan) {
    if (!["ATIVO", "ATRASADO"].includes(loan.status)) {
      return '<span class="inline-status">Sem ação</span>';
    }

    const renewButton = loan.status === "ATIVO" && !loan.renovado
      ? `<button class="button ghost small" type="button" data-renew-loan="${loan.id}">Renovar</button>`
      : "";
    return `
      <div class="table-action-group">
        ${renewButton}
        <button class="button primary small" type="button" data-return-loan="${loan.id}">Registrar devolução</button>
      </div>
    `;
  }

  function filterReturnLoanPicker() {
    if (!document.getElementById("returnLoanList")) return;

    const term = (document.getElementById("returnLoanSearchInput")?.value || "").trim().toLowerCase();
    const status = document.getElementById("returnLoanStatusFilter")?.value || "";
    const filtered = cachedLoans.filter((loan) => {
      const matchesOpen = loan.status !== "DEVOLVIDO";
      const matchesStatus = !status || loan.status === status;
      const matchesTerm = !term || [loan.id, loan.cliente?.nome, loan.livro?.titulo, loan.status]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesOpen && matchesStatus && matchesTerm;
    });
    renderReturnLoanPicker(filtered);
    renderReturnPickerSummary(filtered);
  }

  function renderReturnPickerSummary(loans) {
    const container = document.getElementById("returnPickerSummary");
    if (!container) return;

    const active = loans.filter((loan) => loan.status === "ATIVO").length;
    const late = loans.filter((loan) => loan.status === "ATRASADO").length;
    const lost = loans.filter((loan) => loan.status === "EXTRAVIADO").length;
    container.innerHTML = `
      <span><strong>${active}</strong> ativos</span>
      <span><strong>${late}</strong> atrasados</span>
      <span><strong>${lost}</strong> extraviados</span>
    `;
  }

  function renderReturnLoanPicker(loans) {
    const container = document.getElementById("returnLoanList");
    const activeLoans = loans
      .filter((loan) => loan.status !== "DEVOLVIDO")
      .sort((a, b) => b.id - a.id);

    if (!activeLoans.length) {
      container.innerHTML = '<div class="status-item">Nenhum empréstimo ativo encontrado para devolução.</div>';
      return;
    }

    container.innerHTML = activeLoans.map((loan) => `
      <div class="loan-picker-card ${selectedReturnLoanId === loan.id ? "selected" : ""} ${loan.status === "ATRASADO" ? "is-late" : ""}">
        <div class="loan-picker-main">
          <span class="loan-picker-code">Empréstimo #${loan.id}</span>
          <strong>${app.escapeHtml(loan.cliente?.nome || "Cliente não informado")}</strong>
          <p>${app.escapeHtml(loan.livro?.titulo || "Livro não informado")}</p>
        </div>
        <div class="loan-picker-meta">
          <span><small>Emprestado</small>${app.formatDate(loan.dataEmprestimo)}</span>
          <span><small>Prazo</small>${app.formatDate(loan.dataDevolucaoPrevista)}</span>
          <span>
            <small>Status</small>
            ${statusBadge(loan.status)}
          </span>
        </div>
        <button class="button primary small" type="button" data-fill-return-loan="${loan.id}">${selectedReturnLoanId === loan.id ? "Selecionado" : "Selecionar"}</button>
      </div>
    `).join("");

    document.querySelectorAll("[data-fill-return-loan]").forEach((button) => {
      button.addEventListener("click", () => {
        fillReturnFormFromLoan(activeLoans.find((loan) => loan.id === Number(button.dataset.fillReturnLoan)));
      });
    });
  }

  function fillReturnFormFromLoan(loan) {
    if (!loan) {
      return;
    }

    selectedReturnLoanId = loan.id;
    document.getElementById("returnLoanId").value = loan.id;
    document.getElementById("returnClientName").value = loan.cliente?.nome || "";
    document.getElementById("returnBookTitle").value = loan.livro?.titulo || "";
    document.getElementById("returnStartDate").value = app.formatDate(loan.dataEmprestimo);
    if (document.getElementById("returnHelperText")) {
      document.getElementById("returnHelperText").textContent = `Empréstimo #${loan.id} selecionado. Confira o estado do livro antes de registrar.`;
    }
    if (document.getElementById("returnSubmitButton")) {
      document.getElementById("returnSubmitButton").disabled = false;
    }
    renderSelectedReturnCard(loan);
    filterReturnLoanPicker();
    document.getElementById("returnBookState").focus();
  }

  function renderSelectedReturnCard(loan) {
    const container = document.getElementById("selectedReturnCard");
    if (!container) return;

    const days = daysUntil(loan.dataDevolucaoPrevista, new Date());
    const deadlineText = days === null
      ? "Prazo não informado"
      : days < 0
        ? `${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"} em atraso`
        : days === 0
          ? "Devolução vence hoje"
          : `${days} dia${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}`;

    container.innerHTML = `
      <div class="return-selection-main">
        <span class="selection-kicker">Empréstimo selecionado</span>
        <strong>${app.escapeHtml(loan.livro?.titulo || "")}</strong>
        <p>${app.escapeHtml(loan.cliente?.nome || "")}</p>
      </div>
      <div class="selection-meta">
        <span>#${loan.id}</span>
        <span>Emprestado em ${app.formatDate(loan.dataEmprestimo)}</span>
        <span>Prazo ${app.formatDate(loan.dataDevolucaoPrevista)}</span>
        <span>${app.escapeHtml(deadlineText)}</span>
        ${statusBadge(loan.status)}
      </div>
    `;
    container.hidden = false;
    container.classList.remove("empty");
  }

  function renderEmptySelectedReturnCard(message = "Escolha um item da lista ao lado para preencher esta etapa.") {
    const container = document.getElementById("selectedReturnCard");
    if (!container) return;

    container.hidden = false;
    container.classList.add("empty");
    container.innerHTML = `
      <span class="selection-kicker">Aguardando seleção</span>
      <strong>Nenhum empréstimo selecionado</strong>
      <p>${app.escapeHtml(message)}</p>
    `;
  }

  function maybeApplyReturnLoanPrefill(loans) {
    if (returnPrefillApplied || !document.getElementById("returnLoanId")) {
      return;
    }

    const storedLoanId = Number(sessionStorage.getItem(PREFILL_RETURN_LOAN_KEY));
    if (!storedLoanId) {
      return;
    }

    const loan = loans.find((item) => item.id === storedLoanId && item.status !== "DEVOLVIDO");
    returnPrefillApplied = true;
    sessionStorage.removeItem(PREFILL_RETURN_LOAN_KEY);
    if (loan) {
      fillReturnFormFromLoan(loan);
    }
  }

  function renderReturnHistory(returns) {
    const container = document.getElementById("returnHistory");
    renderReturnSummary(returns);
    filteredReturnHistory = returns.slice();
    if (!returns.length) {
      container.innerHTML = '<div class="status-item">Nenhuma devolução registrada no momento.</div>';
      renderSimplePagination("returnHistoryPagination", 0, 1, 1, () => {});
      return;
    }

    const totalPages = Math.max(1, Math.ceil(returns.length / returnHistoryPageSize));
    if (returnHistoryCurrentPage > totalPages) {
      returnHistoryCurrentPage = totalPages;
    }
    const start = (returnHistoryCurrentPage - 1) * returnHistoryPageSize;
    const pageItems = returns.slice(start, start + returnHistoryPageSize);

    container.innerHTML = pageItems.map((returnItem) => `
      <div class="status-item return-history-item">
        <div>
          <strong>${app.escapeHtml(returnItem.cliente?.nome || "Cliente não informado")}</strong>
          <p>${app.escapeHtml(returnItem.livro?.titulo || "Livro não informado")}</p>
          ${returnItem.observacao ? `<p>${app.escapeHtml(returnItem.observacao)}</p>` : ""}
        </div>
        <div class="return-history-side">
          <span>${app.formatDate(returnItem.dataDevolucao)}</span>
          <span class="status-badge ${String(returnItem.estadoLivro || "").toUpperCase() === "AVARIADO" ? "warning" : "success"}">${app.escapeHtml(returnItem.estadoLivro || "BOM")}</span>
        </div>
      </div>
    `).join("");

    renderSimplePagination("returnHistoryPagination", returns.length, returnHistoryCurrentPage, totalPages, (page) => {
      returnHistoryCurrentPage = page;
      renderReturnHistory(filteredReturnHistory);
    });
  }

  function renderReturnSummary(returns) {
    const container = document.getElementById("returnHistorySummary");
    if (!container) {
      return;
    }

    const good = returns.filter((item) => String(item.estadoLivro || "").toUpperCase() === "BOM").length;
    const damaged = returns.filter((item) => String(item.estadoLivro || "").toUpperCase() === "AVARIADO").length;

    container.innerHTML = `
      <span><strong>${returns.length}</strong> devoluções</span>
      <span><strong>${good}</strong> bom estado</span>
      <span><strong>${damaged}</strong> com avaria</span>
    `;
  }

  function renderReturnHistoryPeriodOptions(returns) {
    const monthSelect = document.getElementById("returnHistoryMonthFilter");
    const yearSelect = document.getElementById("returnHistoryYearFilter");
    if (!monthSelect || !yearSelect) return;

    const selectedMonth = monthSelect.value;
    const selectedYear = yearSelect.value;
    const dates = returns
      .map((item) => parseLocalDate(item.dataDevolucao))
      .filter(Boolean);
    const years = [...new Set(dates.map((date) => date.getFullYear()))].sort((a, b) => b - a);
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    monthSelect.innerHTML = '<option value="">Todos os meses</option>' + months.map((month, index) => (
      `<option value="${index + 1}">${month}</option>`
    )).join("");
    yearSelect.innerHTML = '<option value="">Todos os anos</option>' + years.map((year) => (
      `<option value="${year}">${year}</option>`
    )).join("");

    if ([...monthSelect.options].some((option) => option.value === selectedMonth)) {
      monthSelect.value = selectedMonth;
    }
    if ([...yearSelect.options].some((option) => option.value === selectedYear)) {
      yearSelect.value = selectedYear;
    }
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function renderLateList(loans) {
    const container = document.getElementById("lateList");
    filteredLateLoans = Array.isArray(loans) ? loans : [];
    const totalPages = Math.max(1, Math.ceil(filteredLateLoans.length / latePageSize));
    if (lateCurrentPage > totalPages) {
      lateCurrentPage = totalPages;
    }
    const start = (lateCurrentPage - 1) * latePageSize;
    const pageLoans = filteredLateLoans.slice(start, start + latePageSize);

    if (!loans.length) {
      container.innerHTML = '<div class="status-item">Nenhum empréstimo atrasado no momento.</div>';
      renderSimplePagination("latePagination", 0, 1, 1, () => {});
      return;
    }

    container.innerHTML = pageLoans.map((loan) => {
      const overdueDays = Math.max(0, Math.abs(daysUntil(loan.dataDevolucaoPrevista, new Date()) || 0));
      const delayText = loan.status === "EXTRAVIADO"
        ? "Exemplar marcado como extraviado"
        : `${overdueDays} dia${overdueDays === 1 ? "" : "s"} em atraso`;
      const lastContact = loan.historicoContato ? loan.historicoContato.split("\n").slice(-1)[0] : "";

      return `
        <div class="late-card ${loan.status === "EXTRAVIADO" ? "lost" : "overdue"}">
          <div class="late-card-main">
            <span class="late-card-kicker">Empréstimo #${loan.id}${loan.reservaId ? ` · Reserva #${loan.reservaId}` : ""}</span>
            <strong>${app.escapeHtml(loan.cliente?.nome || "Cliente não informado")}</strong>
            <p>${app.escapeHtml(loan.livro?.titulo || "Livro não informado")}</p>
            ${lastContact ? `<small class="loan-contact-history">Último contato: ${app.escapeHtml(lastContact)}</small>` : ""}
          </div>
          <div class="late-card-dates">
            <span><small>Emprestado</small>${app.formatDate(loan.dataEmprestimo)}</span>
            <span><small>Prazo</small>${app.formatDate(loan.dataDevolucaoPrevista)}</span>
          </div>
          <div class="late-card-alert">
            ${statusBadge(loan.status)}
            <strong>${app.escapeHtml(delayText)}</strong>
            <small>Prazo vencido em ${app.formatDate(loan.dataDevolucaoPrevista)}</small>
          </div>
          <div class="late-card-actions">
            <button class="button ghost small" type="button" data-contact-loan="${loan.id}">Registrar contato</button>
            <button class="button primary small" type="button" data-return-loan="${loan.id}">Devolução</button>
            <button class="button danger small" type="button" data-lost-loan="${loan.id}" ${loan.status === "EXTRAVIADO" ? "disabled" : ""}>Extraviado</button>
            <button class="button secondary small" type="button" data-history-loan="${loan.id}" ${loan.historicoContato ? "" : "disabled"}>Histórico</button>
          </div>
        </div>
      `;
    }).join("");
    renderSimplePagination("latePagination", filteredLateLoans.length, lateCurrentPage, totalPages, (page) => {
      lateCurrentPage = page;
      renderLateList(filteredLateLoans);
    });
    bindLateLoanActions();
  }

  function bindLateLoanActions() {
    document.querySelectorAll("[data-contact-loan]").forEach((button) => {
      button.addEventListener("click", () => openContactModal(Number(button.dataset.contactLoan)));
    });

    document.querySelectorAll("[data-history-loan]").forEach((button) => {
      button.addEventListener("click", () => openContactModal(Number(button.dataset.historyLoan), true));
    });

    document.querySelectorAll("[data-lost-loan]").forEach((button) => {
      button.addEventListener("click", () => openLostModal(Number(button.dataset.lostLoan)));
    });

    document.querySelectorAll("#lateList [data-return-loan]").forEach((button) => {
      button.addEventListener("click", () => {
        sessionStorage.setItem(PREFILL_RETURN_LOAN_KEY, button.dataset.returnLoan);
        window.location.href = "adm-devolucao.html";
      });
    });
  }

  function openContactModal(loanId, historyOnly = false) {
    const loan = cachedLateLoans.find((item) => item.id === loanId);
    const modal = document.getElementById("contactModal");
    if (!loan || !modal) return;

    pendingLateLoanAction = loan;
    setTextIfPresent("contactModalLoan", `#${loan.id} - ${loan.cliente.nome}`);
    setTextIfPresent("contactModalBook", loan.livro.titulo);
    const history = document.getElementById("contactHistory");
    if (history) {
      const lines = String(loan.historicoContato || "").split("\n").filter(Boolean);
      history.innerHTML = lines.length
        ? lines.map((line) => `<li>${app.escapeHtml(line)}</li>`).join("")
        : "<li>Nenhum contato registrado ainda.</li>";
    }
    const form = document.getElementById("contactModalForm");
    if (form) {
      form.hidden = historyOnly;
      form.reset();
    }
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (!historyOnly) {
      setTimeout(() => document.getElementById("contactNote")?.focus(), 0);
    }
  }

  function openLostModal(loanId) {
    const loan = cachedLateLoans.find((item) => item.id === loanId);
    const modal = document.getElementById("lostModal");
    if (!loan || !modal) return;

    pendingLateLoanAction = loan;
    setTextIfPresent("lostModalLoan", `#${loan.id} - ${loan.cliente.nome}`);
    setTextIfPresent("lostModalBook", loan.livro.titulo);
    const currentTotal = document.getElementById("lostCurrentTotal");
    if (currentTotal) {
      currentTotal.textContent = `${loan.livro.quantidadeTotal} no acervo`;
    }
    const nextTotal = document.getElementById("lostNextTotal");
    if (nextTotal) {
      nextTotal.textContent = `${Math.max(0, Number(loan.livro.quantidadeTotal || 0) - 1)} após extravio`;
    }
    document.getElementById("lostModalForm")?.reset();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(() => document.getElementById("lostNote")?.focus(), 0);
  }

  function closeLateActionModals() {
    pendingLateLoanAction = null;
    ["contactModal", "lostModal"].forEach((id) => {
      const modal = document.getElementById(id);
      if (modal) modal.hidden = true;
    });
    document.body.classList.remove("modal-open");
  }

  async function submitContactModal(event) {
    event.preventDefault();
    if (!pendingLateLoanAction) return;

    const canal = document.getElementById("contactChannel")?.value || "contato";
    const observacao = document.getElementById("contactNote")?.value || "";
    if (!observacao.trim()) {
      notify("Informe o registro do contato.", "error");
      return;
    }

    try {
      await app.request(`/emprestimos/${pendingLateLoanAction.id}/contato`, {
        method: "PATCH",
        body: {
          administradorId: 1,
          canal,
          observacao: observacao.trim()
        }
      });
      notify("Contato registrado e cliente mantido bloqueado por pendência.");
      closeLateActionModals();
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function submitLostModal(event) {
    event.preventDefault();
    if (!pendingLateLoanAction) return;

    const observacao = document.getElementById("lostNote")?.value || "Exemplar marcado como extraviado.";
    try {
      await app.request(`/emprestimos/${pendingLateLoanAction.id}/extraviar`, {
        method: "PATCH",
        body: {
          administradorId: 1,
          observacao
        }
      });
      notify("Empréstimo marcado como extraviado. Cliente bloqueado e estoque ajustado.");
      closeLateActionModals();
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function renderUsers(users) {
    filteredUsers = Array.isArray(users) ? users : [];
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
    if (userCurrentPage > totalPages) {
      userCurrentPage = totalPages;
    }
    const start = (userCurrentPage - 1) * userPageSize;
    const pageUsers = filteredUsers.slice(start, start + userPageSize);

    if (!filteredUsers.length) {
      document.getElementById("userTable").innerHTML = '<tr><td colspan="7">Nenhum cliente encontrado.</td></tr>';
      renderSimplePagination("userPagination", 0, 1, 1, () => {});
      return;
    }

    document.getElementById("userTable").innerHTML = pageUsers.map((user) => `
      <tr>
        <td>${user.id}</td>
        <td>${app.escapeHtml(user.nome)}</td>
        <td>${app.escapeHtml(formatCpf(user.cpf))}</td>
        <td>${app.escapeHtml(user.email)}</td>
        <td>${app.escapeHtml(formatPhoneNumber(user.telefone))}</td>
        <td>
          ${statusBadge(user.bloqueado ? "BLOQUEADO" : "LIBERADO")}
          ${user.bloqueado && user.motivoBloqueio ? `<small class="user-block-reason">${app.escapeHtml(user.motivoBloqueio)}</small>` : ""}
        </td>
        <td><button class="button secondary small table-row-action" type="button" data-user-history="${user.id}">Ver</button></td>
      </tr>
    `).join("");
    document.querySelectorAll("[data-user-history]").forEach((button) => {
      button.addEventListener("click", () => {
        openUserHistory(Number(button.dataset.userHistory));
      });
    });
    renderSimplePagination("userPagination", filteredUsers.length, userCurrentPage, totalPages, (page) => {
      userCurrentPage = page;
      renderUsers(filteredUsers);
    });
  }

  function formatCpf(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    return value || "-";
  }

  function formatPhoneNumber(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return value || "-";
  }

  function openUserHistory(userId) {
    const user = cachedUsers.find((item) => item.id === userId);
    const modal = document.getElementById("userHistoryModal");
    const title = document.getElementById("userHistoryTitle");
    const subtitle = document.getElementById("userHistorySubtitle");
    const content = document.getElementById("userHistoryContent");
    if (!user || !modal || !title || !subtitle || !content) return;

    const reservations = pendingReservations
      .filter((item) => item.clienteId === userId || item.cliente?.id === userId)
      .map((item) => ({
        type: "Reserva",
        date: item.dataReserva,
        title: item.livro?.titulo || "Livro não informado",
        meta: `Prazo de retirada: ${formatDisplayDate(item.prazoRetirada)}`,
        status: item.status || "-"
      }));
    const loans = cachedLoans
      .filter((item) => item.clienteId === userId || item.cliente?.id === userId)
      .map((item) => ({
        type: "Empréstimo",
        date: item.dataEmprestimo,
        title: item.livro?.titulo || "Livro não informado",
        meta: `Devolução prevista: ${formatDisplayDate(item.dataDevolucaoPrevista)}`,
        status: item.status || "-"
      }));
    const userLoanIds = new Set(cachedLoans
      .filter((item) => item.clienteId === userId || item.cliente?.id === userId)
      .map((item) => item.id));
    const returns = cachedReturns
      .filter((item) => item.cliente?.id === userId || userLoanIds.has(item.emprestimoId))
      .map((item) => ({
        type: "Devolução",
        date: item.dataDevolucao,
        title: item.livro?.titulo || "Livro não informado",
        meta: item.estadoLivro ? `Estado do livro: ${item.estadoLivro}` : "Devolução registrada",
        status: item.statusDevolucao || "-"
      }));
    const history = [...reservations, ...loans, ...returns]
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    title.textContent = `Histórico de ${user.nome}`;
    subtitle.textContent = `${formatCpf(user.cpf)} · ${formatPhoneNumber(user.telefone)} · ${user.email}`;
    content.innerHTML = history.length
      ? history.map((item) => `
          <article class="history-card">
            <div>
              <span class="history-type">${app.escapeHtml(item.type)}</span>
              <strong>${app.escapeHtml(item.title)}</strong>
              <small>${app.escapeHtml(item.meta)}</small>
            </div>
            <div class="history-side">
              <span>${formatDisplayDate(item.date)}</span>
              ${statusBadge(item.status)}
            </div>
          </article>
        `).join("")
      : '<p class="empty-insight">Este cliente ainda não possui reservas, empréstimos ou devoluções registradas.</p>';

    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeUserHistoryModal() {
    const modal = document.getElementById("userHistoryModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function formatDisplayDate(value) {
    return value ? app.formatDate(value) : "-";
  }

  function renderBooks(books) {
    const table = document.getElementById("bookTable");
    if (!table) return;

    filteredBooks = Array.isArray(books) ? books : [];
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / bookPageSize));
    if (bookCurrentPage > totalPages) {
      bookCurrentPage = totalPages;
    }
    const start = (bookCurrentPage - 1) * bookPageSize;
    const pageBooks = filteredBooks.slice(start, start + bookPageSize);

    if (!books.length) {
      table.innerHTML = '<tr><td colspan="8">Nenhum livro encontrado.</td></tr>';
      renderBookPagination();
      return;
    }

    table.innerHTML = pageBooks.map((book) => `
      <tr class="${selectedBookId === book.id ? "selected-row" : ""}">
        <td>${book.id}</td>
        <td>${app.escapeHtml(book.titulo)}</td>
        <td>${app.escapeHtml(book.autor)}</td>
        <td>${app.escapeHtml(book.categoria)}</td>
        <td>${book.quantidadeDisponivel}</td>
        <td>${book.quantidadeTotal}</td>
        <td>${statusBadge(book.status)}</td>
        <td>
          <div class="table-row-actions">
            <button class="button primary small table-row-action" type="button" data-edit-book="${book.id}">Editar</button>
          </div>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll("[data-edit-book]").forEach((button) => {
      button.addEventListener("click", () => {
        editBook(Number(button.dataset.editBook));
      });
    });

    renderBookPagination();
  }

  function renderBookPagination() {
    const container = document.getElementById("bookPagination");
    if (!container) return;

    const total = filteredBooks.length;
    const totalPages = Math.max(1, Math.ceil(total / bookPageSize));
    const start = total ? (bookCurrentPage - 1) * bookPageSize + 1 : 0;
    const end = total ? Math.min(start + bookPageSize - 1, total) : 0;
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
      .filter((page) => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - bookCurrentPage) <= 1);

    container.innerHTML = `
      <span class="pagination-summary">Mostrando ${start}-${end} de ${total} livros</span>
      <div class="pagination-actions">
        <button class="page-button" type="button" data-book-page="prev" ${bookCurrentPage === 1 ? "disabled" : ""}>Anterior</button>
        ${pages.map((page, index) => {
          const previous = pages[index - 1];
          const gap = previous && page - previous > 1 ? '<span class="page-gap">...</span>' : "";
          return `${gap}<button class="page-button ${page === bookCurrentPage ? "active" : ""}" type="button" data-book-page="${page}">${page}</button>`;
        }).join("")}
        <button class="page-button" type="button" data-book-page="next" ${bookCurrentPage === totalPages ? "disabled" : ""}>Próxima</button>
      </div>
    `;

    container.querySelectorAll("[data-book-page]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.bookPage;
        if (target === "prev") {
          bookCurrentPage = Math.max(1, bookCurrentPage - 1);
        } else if (target === "next") {
          bookCurrentPage = Math.min(totalPages, bookCurrentPage + 1);
        } else {
          bookCurrentPage = Number(target);
        }
        renderBooks(filteredBooks);
      });
    });
  }

  function renderSimplePagination(containerId, total, currentPage, totalPages, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const start = total ? (currentPage - 1) * getPageSizeForContainer(containerId) + 1 : 0;
    const end = total ? Math.min(start + getPageSizeForContainer(containerId) - 1, total) : 0;
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
      .filter((page) => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

    container.innerHTML = `
      <span class="pagination-summary">Mostrando ${start}-${end} de ${total}</span>
      <div class="pagination-actions">
        <button class="page-button" type="button" data-page-target="prev" ${currentPage === 1 ? "disabled" : ""}>Anterior</button>
        ${pages.map((page, index) => {
          const previous = pages[index - 1];
          const gap = previous && page - previous > 1 ? '<span class="page-gap">...</span>' : "";
          return `${gap}<button class="page-button ${page === currentPage ? "active" : ""}" type="button" data-page-target="${page}">${page}</button>`;
        }).join("")}
        <button class="page-button" type="button" data-page-target="next" ${currentPage === totalPages ? "disabled" : ""}>Próxima</button>
      </div>
    `;

    container.querySelectorAll("[data-page-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.pageTarget;
        if (target === "prev") {
          onChange(Math.max(1, currentPage - 1));
        } else if (target === "next") {
          onChange(Math.min(totalPages, currentPage + 1));
        } else {
          onChange(Number(target));
        }
      });
    });
  }

  function getPageSizeForContainer(containerId) {
    if (containerId === "loanPagination") return loanPageSize;
    if (containerId === "latePagination") return latePageSize;
    if (containerId === "userPagination") return userPageSize;
    if (containerId === "returnHistoryPagination") return returnHistoryPageSize;
    return 20;
  }

  function renderBookCategoryOptions(books) {
    const select = document.getElementById("bookCategoryFilter");
    if (!select) return;

    const currentValue = select.value;
    const categories = [...new Set(books.map((book) => book.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    select.innerHTML = '<option value="">Todas as categorias</option>' + categories.map((category) => (
      `<option value="${app.escapeHtml(category)}">${app.escapeHtml(category)}</option>`
    )).join("");
    if (categories.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  async function updateBookStock(bookId) {
    const book = cachedBooks.find((item) => item.id === bookId);
    if (!book) {
      notify("Livro não encontrado para atualizar o estoque.", "error");
      return;
    }

    const availableInput = document.querySelector(`[data-stock-available="${bookId}"]`);
    const totalInput = document.querySelector(`[data-stock-total="${bookId}"]`);
    const available = Number(availableInput?.value);
    const total = Number(totalInput?.value);

    if (!Number.isInteger(total) || total < 0) {
      notify("O total no acervo não pode ser negativo. Se todos os exemplares foram perdidos, use 0 no total e 0 em disponível.", "error");
      return;
    }

    if (!Number.isInteger(available) || available < 0) {
      notify("A quantidade disponível não pode ser negativa.", "error");
      return;
    }

    if (available > total) {
      notify("A quantidade disponível não pode ser maior que o total no acervo.", "error");
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
      notify("Estoque atualizado com sucesso.");
      filterBooks();
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function filterUsers(resetPage = false) {
    if (!document.getElementById("userSearchInput")) return;
    const term = document.getElementById("userSearchInput").value.trim().toLowerCase();
    const status = document.getElementById("userStatusFilter")?.value || "";
    const filtered = cachedUsers.filter((user) => {
      const matchesTerm = !term || [user.nome, user.email, user.cpf, user.telefone, user.motivoBloqueio]
        .some((value) => String(value || "").toLowerCase().includes(term));
      const matchesStatus = !status || (status === "BLOQUEADO" ? user.bloqueado : !user.bloqueado);
      return matchesTerm && matchesStatus;
    });
    if (resetPage) {
      userCurrentPage = 1;
    }
    renderUsers(filtered);
  }

  function filterLoans(resetPage = false) {
    if (!document.getElementById("loanTable")) return;
    const term = (document.getElementById("loanSearchInput")?.value || "").trim().toLowerCase();
    const status = document.getElementById("loanStatusFilter")?.value || "";
    const filtered = cachedLoans.filter((loan) => {
      const matchesStatus = !status || loan.status === status;
      const matchesTerm = !term || [loan.id, loan.reservaId, loan.cliente?.nome, loan.livro?.titulo, loan.status]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesStatus && matchesTerm;
    });
    if (resetPage) {
      loanCurrentPage = 1;
    }
    renderLoanTable(filtered);
    renderLoanSummary(filtered);
  }

  function filterBooks(resetPage = false) {
    if (!document.getElementById("bookSearchInput")) return;
    const term = document.getElementById("bookSearchInput").value.trim().toLowerCase();
    const category = document.getElementById("bookCategoryFilter")?.value || "";
    const filtered = cachedBooks.filter((book) => {
      const matchesTerm = !term || [book.titulo, book.autor, book.categoria, book.status]
        .some((value) => String(value || "").toLowerCase().includes(term));
      const matchesCategory = !category || book.categoria === category;
      return matchesTerm && matchesCategory;
    });
    if (resetPage) {
      bookCurrentPage = 1;
    }
    renderBooks(filtered);
  }

  function handleBookPageSizeChange() {
    const value = Number(document.getElementById("bookPageSize")?.value || 20);
    bookPageSize = Number.isInteger(value) && value > 0 ? value : 20;
    bookCurrentPage = 1;
    filterBooks();
  }

  function handleLoanPageSizeChange() {
    const value = Number(document.getElementById("loanPageSize")?.value || 12);
    loanPageSize = Number.isInteger(value) && value > 0 ? value : 12;
    loanCurrentPage = 1;
    filterLoans();
  }

  function handleLatePageSizeChange() {
    const value = Number(document.getElementById("latePageSize")?.value || 10);
    latePageSize = Number.isInteger(value) && value > 0 ? value : 10;
    lateCurrentPage = 1;
    filterLateLoans();
  }

  function handleReturnHistoryPageSizeChange() {
    const value = Number(document.getElementById("returnHistoryPageSize")?.value || 5);
    returnHistoryPageSize = Number.isInteger(value) && value > 0 ? value : 5;
    returnHistoryCurrentPage = 1;
    filterReturnHistory();
  }

  function filterLateLoans(resetPage = false) {
    if (!document.getElementById("lateSearchInput")) return;
    const term = document.getElementById("lateSearchInput").value.trim().toLowerCase();
    const status = document.getElementById("lateStatusFilter")?.value || "";
    const filtered = cachedLateLoans.filter((loan) => {
      const matchesStatus = !status || loan.status === status;
      const matchesTerm = !term || [loan.id, loan.reservaId, loan.cliente.nome, loan.livro.titulo, loan.status]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesStatus && matchesTerm;
    });
    if (resetPage) {
      lateCurrentPage = 1;
    }
    renderLateList(filtered);
  }

  function filterReturnHistory(resetPage = false) {
    if (!document.getElementById("returnHistory")) return;
    const term = (document.getElementById("returnSearchInput")?.value || "").trim().toLowerCase();
    const state = document.getElementById("returnHistoryStateFilter")?.value || "";
    const month = document.getElementById("returnHistoryMonthFilter")?.value || "";
    const year = document.getElementById("returnHistoryYearFilter")?.value || "";
    const filtered = cachedReturns.filter((returnItem) => {
      const date = parseLocalDate(returnItem.dataDevolucao);
      const matchesState = !state || String(returnItem.estadoLivro || "").toUpperCase() === state;
      const matchesMonth = !month || (date && date.getMonth() + 1 === Number(month));
      const matchesYear = !year || (date && date.getFullYear() === Number(year));
      const matchesTerm = !term || [returnItem.id, returnItem.emprestimoId, returnItem.cliente?.nome, returnItem.livro?.titulo, returnItem.observacao]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesState && matchesMonth && matchesYear && matchesTerm;
    });
    if (resetPage) {
      returnHistoryCurrentPage = 1;
    }
    renderReturnHistory(filtered);
  }

  function clearBookForm() {
    selectedBookId = null;
    const form = document.getElementById("bookForm");
    if (form) {
      form.reset();
    }
    if (document.getElementById("bookId")) {
      document.getElementById("bookId").value = "";
    }
    if (document.getElementById("bookDisplayId")) {
      document.getElementById("bookDisplayId").value = "";
    }
    setBookModalMode();
    filterBooks();
    if (document.getElementById("bookTitle")) {
      document.getElementById("bookTitle").focus();
    }
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
    setBookModalMode(book);
  }

  function setBookModalMode(book = null) {
    const title = document.getElementById("bookModalTitle");
    const subtitle = document.getElementById("bookModalSubtitle");
    const saveButton = document.getElementById("saveBookButton");
    const deleteButton = document.getElementById("deleteBookInModalButton");
    if (!title || !subtitle || !saveButton) return;

    title.textContent = book ? "Editar livro" : "Cadastrar livro";
    subtitle.textContent = book
      ? "Atualize os dados completos do título selecionado."
      : "Preencha os dados para incluir um novo título no acervo.";
    saveButton.textContent = book ? "Salvar" : "Salvar livro";
    if (deleteButton) {
      deleteButton.hidden = !book;
    }
  }

  function openBookModal(book = null) {
    const modal = document.getElementById("bookModal");
    if (!modal) return;

    if (book) {
      fillBookForm(book);
    } else {
      clearBookForm();
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(() => document.getElementById("bookTitle")?.focus(), 0);
  }

  function openNewBookModal() {
    selectedBookId = null;
    openBookModal();
  }

  function closeBookModal() {
    const modal = document.getElementById("bookModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (window.location.hash === "#gestao") {
      history.replaceState(null, "", window.location.pathname);
      normalizeAdminNavigation();
    }
  }

  function focusSelectedBook() {
    if (!selectedBookId) {
      notify("Selecione um livro na tabela para editar.", "error");
      return;
    }
    editBook(selectedBookId);
  }

  function editBook(bookId) {
    selectedBookId = bookId;
    if (!document.getElementById("bookForm")) {
      sessionStorage.setItem(EDIT_BOOK_KEY, String(selectedBookId));
      window.location.href = "adm-livros.html";
      return;
    }
    const book = cachedBooks.find((item) => item.id === selectedBookId);
    if (!book) {
      notify("Livro não encontrado para edição.", "error");
      return;
    }
    openBookModal(book);
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
    openBookModal(book);
  }

  function maybeOpenBookModalFromHash() {
    if (window.location.hash === "#gestao" && document.getElementById("bookModal")?.hidden) {
      openNewBookModal();
    }
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
      selectedReservationId = null;
      if (document.getElementById("selectedReservationCard")) {
        document.getElementById("selectedReservationCard").hidden = true;
        document.getElementById("selectedReservationCard").innerHTML = "";
      }
      if (document.getElementById("loanSubmitButton")) {
        document.getElementById("loanSubmitButton").disabled = true;
      }
      closeLoanModal();
      notify("Retirada confirmada com sucesso.");
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
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
      if (document.getElementById("returnClientName")) {
        document.getElementById("returnClientName").value = "";
      }
      if (document.getElementById("returnBookTitle")) {
        document.getElementById("returnBookTitle").value = "";
      }
      if (document.getElementById("returnStartDate")) {
        document.getElementById("returnStartDate").value = "Selecione um empréstimo";
      }
      if (document.getElementById("returnHelperText")) {
        document.getElementById("returnHelperText").textContent = "Devolução registrada com sucesso.";
      }
      selectedReturnLoanId = null;
      if (document.getElementById("returnSubmitButton")) {
        document.getElementById("returnSubmitButton").disabled = true;
      }
      if (document.getElementById("selectedReturnCard")) {
        document.getElementById("selectedReturnCard").hidden = true;
        document.getElementById("selectedReturnCard").innerHTML = "";
        renderEmptySelectedReturnCard("Devolução registrada. Selecione outro empréstimo para continuar.");
      }
      notify("Devolução registrada com sucesso.");
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function submitBookForm(event) {
    event.preventDefault();
    const total = Number(document.getElementById("bookTotal").value);
    const available = Number(document.getElementById("bookAvailable").value);

    if (!Number.isInteger(total) || total < 0) {
      notify("O total no acervo não pode ser negativo. Se todos os exemplares foram perdidos, use 0 no total e 0 em disponível.", "error");
      return;
    }

    if (!Number.isInteger(available) || available < 0) {
      notify("A quantidade disponível não pode ser negativa.", "error");
      return;
    }

    if (available > total) {
      notify("A quantidade disponível não pode ser maior que o total no acervo.", "error");
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
      if (document.getElementById("bookId")) {
        document.getElementById("bookId").value = "";
      }
      notify(id ? "Livro atualizado com sucesso." : "Livro cadastrado com sucesso.");
      closeBookModal();
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function deleteSelectedBook() {
    if (!selectedBookId) {
      notify("Selecione um livro na tabela para excluir.", "error");
      return;
    }
    deleteBook(selectedBookId);
  }

  async function deleteBook(bookId) {
    selectedBookId = bookId;
    if (!confirm("Deseja realmente excluir este livro?")) {
      return;
    }
    try {
      await app.request(`/livros/${bookId}`, { method: "DELETE" });
      if (document.getElementById("bookForm")) {
        document.getElementById("bookForm").reset();
      }
      selectedBookId = null;
      if (document.getElementById("bookDisplayId")) {
        document.getElementById("bookDisplayId").value = "";
      }
      closeBookModal();
      notify("Livro excluído com sucesso.");
      filterBooks();
      loadDashboard();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function deleteBookFromModal() {
    const bookId = Number(document.getElementById("bookId")?.value || selectedBookId);
    if (!bookId) {
      notify("Abra um livro para excluir.", "error");
      return;
    }
    deleteBook(bookId);
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

  function normalizeAdminNavigation() {
    const nav = document.querySelector(".admin-nav");
    if (!nav) return;

    const items = [
      { key: "overview", href: "adm.html", label: "Visão geral" },
      { key: "checkout", href: "adm-reservas.html", label: "Confirmar retirada" },
      { key: "loans", href: "adm-emprestimo.html", label: "Empréstimos ativos" },
      { key: "returns", href: "adm-devolucao.html", label: "Registrar devolução" },
      { key: "late", href: "adm-atrasos.html", label: "Empréstimos atrasados" },
      { key: "books", href: "adm-livros.html", label: "Livros e estoque" },
      { key: "users", href: "adm-usuarios.html", label: "Clientes" },
      { key: "manage-books", href: "adm-livros.html#gestao", label: "Cadastrar livro" }
    ];

    nav.innerHTML = items.map((item) => (
      `<a href="${item.href}" data-admin-nav="${item.key}">${item.label}</a>`
    )).join("");

    const updateActiveItem = () => {
      const fileName = window.location.pathname.split("/").pop() || "adm.html";
      const hash = window.location.hash;
      let activeKey = "overview";

      if (fileName === "adm-reservas.html") activeKey = "checkout";
      if (fileName === "adm-emprestimo.html") activeKey = "loans";
      if (fileName === "adm-devolucao.html") activeKey = "returns";
      if (fileName === "adm-atrasos.html") activeKey = "late";
      if (fileName === "adm-livros.html") activeKey = hash === "#gestao" ? "manage-books" : "books";
      if (fileName === "adm-usuarios.html") activeKey = "users";

      nav.querySelectorAll("a").forEach((link) => {
        link.classList.toggle("active", link.dataset.adminNav === activeKey);
      });
    };

    nav.querySelector('[data-admin-nav="manage-books"]')?.addEventListener("click", () => {
      setTimeout(updateActiveItem, 0);
    });
    window.addEventListener("hashchange", updateActiveItem);
    updateActiveItem();
  }
})();
