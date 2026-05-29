(function () {

  function renderSimilarBooks(book, books) {
    const similar = books
      .filter((item) => item.id !== book.id && item.quantidadeReservavel > 0)
      .map((item) => ({
        ...item,
        score: (item.categoria === book.categoria ? 2 : 0) + (item.autor === book.autor ? 1 : 0)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.titulo.localeCompare(b.titulo, "pt-BR"))
      .slice(0, 3);

    if (!similar.length) {
      return "";
    }

    return `
      <section class="similar-books">
        <div>
          <span class="similar-kicker">Sugestões semelhantes</span>
          <h2>Disponíveis agora</h2>
        </div>
        <div class="similar-book-list">
          ${similar.map((item) => `
            <a class="similar-book-card" href="livro.html?id=${item.id}">
              <img src="${app.escapeHtml(item.imagemUrl)}" alt="${app.escapeHtml(item.titulo)}">
              <span>${app.escapeHtml(item.categoria)}</span>
              <strong>${app.escapeHtml(item.titulo)}</strong>
              <small>${app.escapeHtml(item.autor)}</small>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  // ==========================================
  // APP GLOBAL
  // ==========================================

  const app = window.TechBookApp;
  const page = document.body.dataset.page;

 
  // ==========================================
  // INICIALIZAÇÃO DAS PÁGINAS
  // ==========================================

  if (page === "catalog") {
    initCatalog();
  }

  if (page === "book") {
    initBookDetail();
  }

  if (page === "reservations") {
    initReservations();
  }

  if (page === "loans") {
    initLoans();
  }

  if (page === "history") {
    initHistory();
  }

  // ==========================================
  // CATÁLOGO DE LIVROS
  // ==========================================
  
  async function initCatalog() {
  const grid = document.getElementById("catalogGrid");
  const count = document.getElementById("catalogCount");
  const pagination = document.getElementById("pagination");

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchButton = document.getElementById("searchButton");

  let books = [];

  let currentPage = 1;
  const booksPerPage = 16;

    try {
      books = await app.request("/livros");
      populateCategoryFilter(books, categoryFilter);
    } catch (error) {
      grid.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
      count.textContent = "0 título(s)";
      return;
    }


    // ==========================================
    // RENDERIZAÇÃO DOS LIVROS
    // ==========================================

  function render() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = books.filter((book) => {
      const matchesTerm = !term || [book.titulo, book.autor, book.categoria]
        .some((item) => item.toLowerCase().includes(term));

    const matchesCategory =  !category || book.categoria === category;

      return matchesTerm && matchesCategory;
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h2>Nenhum livro encontrado</h2>
          <p>Tente buscar por outro título, autor ou categoria.</p>
        </div>
      `;
      count.textContent = "0 título(s)";
      pagination.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(filtered.length / booksPerPage);
    const start = (currentPage - 1) * booksPerPage;
    const paginatedBooks = filtered.slice(start, start + booksPerPage);

    grid.innerHTML = paginatedBooks.map((book) => `
      <article class="book-card">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <h3>${app.escapeHtml(book.titulo)}</h3>
        <p>${app.escapeHtml(book.autor)}</p>
        <p>${app.escapeHtml(book.categoria)}</p>
        <p>${book.quantidadeReservavel} exemplar(es) liberado(s) para reserva</p>
        ${book.quantidadeReservavel > 0
          ? `<a class="button primary" href="livro.html?id=${book.id}">Ver detalhes</a>`
          : `<a class="button primary" href="livro.html?id=${book.id}">Ver detalhes</a>`}
      </article>
    `).join("");

    document.getElementById("catalogCountText").textContent =
      `${filtered.length} título(s)`;

    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `
        <button class="${i === currentPage ? "active" : ""}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    pagination.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        currentPage = Number(button.dataset.page);
        render();
      });
    });
  }
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      render();
    });

    categoryFilter.addEventListener("change", () => {
      currentPage = 1;
      render();
    });

    searchButton.addEventListener("click", () => {
      currentPage = 1;
      render();
    });

    render();
  }

  function populateCategoryFilter(books, categoryFilter) {
    if (!categoryFilter) {
      return;
    }

    const currentValue = categoryFilter.value;
    const categories = [...new Set(books
      .map((book) => book.categoria)
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));

    categoryFilter.innerHTML = `
      <option value="">Todas Categorias</option>
      ${categories.map((category) => (
        `<option value="${app.escapeHtml(category)}">${app.escapeHtml(category)}</option>`
      )).join("")}
    `;

    if (categories.includes(currentValue)) {
      categoryFilter.value = currentValue;
    }
  }


  // ==========================================
  // DETALHES DO LIVRO
  // ==========================================

  async function initBookDetail() {
    const detail = document.getElementById("bookDetail");
    const bookId = new URLSearchParams(window.location.search).get("id");
    const session = app.getSession();
    let book;
    let books = [];
    let reservations = [];

    try {
      [book, books, reservations] = await Promise.all([
        app.request(`/livros/${bookId}`),
        app.request("/livros"),
        session ? app.request(`/clientes/${session.id}/reservas`) : Promise.resolve([])
      ]);
    } catch (error) {
      detail.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
      return;
    }

    const pendingReservations = reservations.filter((item) => item.status === "PENDENTE");
    const activeReservation = pendingReservations.find((item) => item.livro.id === Number(bookId));

    detail.innerHTML = `
      <a href="catalogo.html" class="back-catalog-link">
        <img src="img/VOLTAR.svg" alt="" class="back-icon">
        Voltar ao catálogo
      </a>

      <section class="book-panel">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <div>
          <span class="book-category">

            <img
              src="img/LIVROS-DISPONIVEIS.svg"
              alt=""
              class="book-category-icon">

            ${app.escapeHtml(book.categoria)}

          </span>
          
          <h1>${app.escapeHtml(book.titulo)}</h1>
          <p>${app.escapeHtml(book.autor)}</p>

          <div id="reservationFeedback"></div>

          <div class="book-actions">
            ${session ? renderReservationButtons(book, activeReservation, pendingReservations.length) : '<a class="button primary" href="login.html">Entrar para reservar</a>'}
          </div>

          <div class="book-info-grid">

            ${book.quantidadeReservavel > 0
              ? `
                <div class="book-info-chip available">
                  <img src="img/DISPONIVEL.svg" alt="" class="book-info-icon">
                  ${book.quantidadeReservavel} ${book.quantidadeReservavel === 1 ? "livro disponível" : "livros disponíveis"} para reserva
                </div>
              `
              : `
                <div class="book-info-chip unavailable">
                  <img src="img/INDISPONIVEL.svg" alt="" class="book-info-icon">
                  Indisponível no momento
                </div>
              `
            }

          </div>

          <div class="description">
            <h2>Descrição</h2>

            <div class="description-text collapsed" id="descriptionText">
              <p>${app.escapeHtml(book.descricao)}</p>
            </div>

            <button class="read-more-button" id="readMoreButton" type="button">
              + Ler sinopse completa
            </button>
          </div>
          ${book.quantidadeReservavel <= 0 ? renderSimilarBooks(book, books) : ""}
        </div>
      </section>
    `;

    const descriptionText = document.getElementById("descriptionText");
    const readMoreButton = document.getElementById("readMoreButton");

    if (descriptionText && readMoreButton) {
      const isLongText = descriptionText.scrollHeight > 170;

      if (!isLongText) {
        readMoreButton.style.display = "none";
        descriptionText.classList.remove("collapsed");
      }

      readMoreButton.addEventListener("click", () => {
        descriptionText.classList.toggle("collapsed");

        const isCollapsed = descriptionText.classList.contains("collapsed");

        readMoreButton.textContent = isCollapsed
          ? "+ Ler sinopse completa"
          : "— Fechar";
      });
    }

    // ==========================================
    // BOTÃO RESERVAR
    // ==========================================

    const reserveButton = document.getElementById("reserveButton");
    if (reserveButton) {
      reserveButton.addEventListener("click", async () => {
        reserveButton.disabled = true;
        reserveButton.textContent = "Reservando...";
        try {
          await app.request("/reservas", { method: "POST", body: { clienteId: session.id, livroId: book.id } });
          app.setFlashMessage("Reserva criada com sucesso. Agora você pode acompanhar o prazo de retirada.");
          window.location.reload();
        } catch (error) {
          reserveButton.disabled = false;
          reserveButton.textContent = "Reservar";
          showReservationError(reserveButton, error.message);
        }
      });
    }

    // ==========================================
    // CANCELAR RESERVA
    // ==========================================

    const cancelButton = document.getElementById("cancelReservationButton");
    if (cancelButton) {
      cancelButton.addEventListener("click", async () => {
        cancelButton.disabled = true;
        cancelButton.textContent = "Cancelando...";
        try {
          await app.request(`/reservas/${activeReservation.id}/cancelar`, { method: "PATCH" });
          app.setFlashMessage("Reserva cancelada. O livro voltou a ficar disponível para novas reservas.");
          window.location.href = "minhas-reservas.html";
        } catch (error) {
          cancelButton.disabled = false;
          cancelButton.textContent = "Cancelar reserva";
          showReservationError(cancelButton, error.message);
        }
      });
    }
  }

  function renderReservationButtons(book, reservation, pendingReservationCount) {
    // O CTA muda conforme sessão, estoque e existência de reserva pendente para o mesmo livro.
    if (reservation) {
      return `
        <span class="button success">Reservado</span>
        <a class="button ghost" href="minhas-reservas.html">Ver minhas reservas</a>
        <button class="button ghost" id="cancelReservationButton" type="button">Cancelar reserva</button>
      `;
    }

    if (pendingReservationCount >= 3) {
      return '<span class="status-chip neutral">Limite de 3 reservas atingido</span>';
    }

    return book.quantidadeReservavel > 0
      ? '<button class="button primary" id="reserveButton" type="button">Reservar</button>'
      : '<span class="status-chip neutral">Reservas indisponíveis no momento</span>';
  }
  
  // ==========================================
  // MINHAS RESERVAS
  // ==========================================

  async function initReservations() {
    const session = app.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const reservationList = document.getElementById("reservationList");
    const logoutButton = document.getElementById("logoutButton");
    const flash = app.consumeFlashMessage();

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    try {
      const reservations = await app.request(`/clientes/${session.id}/reservas`);
      const activeReservations = reservations.filter((item) => item.status === "PENDENTE");
      const closedReservations = reservations.filter((item) => item.status !== "PENDENTE");

      reservationList.innerHTML = `
        ${flash ? `<div class="inline-feedback ${app.escapeHtml(flash.type)}">${app.escapeHtml(flash.message)}</div>` : ""}
        ${activeReservations.length ? activeReservations.map((item) => reservationCard(item, true)).join("") : "<p>Nenhuma reserva ativa no momento.</p>"}
        ${renderClosedReservations(closedReservations)}
      `;

      reservationList.querySelectorAll("[data-cancel-reservation]").forEach((button) => {
        button.addEventListener("click", async () => {
          await app.request(`/reservas/${button.dataset.cancelReservation}/cancelar`, { method: "PATCH" });
          app.setFlashMessage("Reserva cancelada. O livro voltou a ficar disponível para novas reservas.");
          window.location.reload();
        });
      });
    } catch (error) {
      reservationList.innerHTML = `<h2>Reservas</h2><p>${app.escapeHtml(error.message)}</p>`;
    }
  }

  function showReservationError(anchor, message) {
    const friendlyMessage = /bloqueado|pendencia|pendência|devolucao|devolução/i.test(message)
      ? "Sua conta possui uma pendência de devolução. Procure a TechBook para regularizar antes de fazer uma nova reserva."
      : message;
    const existing = document.querySelector(".reservation-error");
    if (existing) {
      existing.textContent = friendlyMessage;
      return;
    }
    const feedback = document.createElement("p");
    feedback.className = "reservation-error inline-feedback error";
    feedback.textContent = friendlyMessage;
    anchor.insertAdjacentElement("afterend", feedback);
  }

  async function initLoans() {
    const session = app.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const loanList = document.getElementById("loanList");
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    try {
      const loans = await app.request(`/clientes/${session.id}/emprestimos`);
      loanList.innerHTML = loans.length
        ? loans.map((item) => reservationCard(item, false)).join("")
        : "<p>Nenhum empréstimo ativo para este cliente.</p>";
    } catch (error) {
      loanList.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
    }
  }

  async function initHistory() {
    const session = app.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const historyList = document.getElementById("historyList");
    const historySummary = document.getElementById("historySummary");
    const historyPagination = document.getElementById("historyPagination");
    const logoutButton = document.getElementById("logoutButton");
    const pageSize = 5;
    let currentPage = 1;
    let historyItems = [];

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    try {
      const [reservations, loans] = await Promise.all([
        app.request(`/clientes/${session.id}/reservas`),
        app.request(`/clientes/${session.id}/emprestimos`)
      ]);

      historyItems = buildClientHistory(reservations, loans);

      const renderPage = () => {
        const totalPages = Math.max(1, Math.ceil(historyItems.length / pageSize));
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }
        const start = (currentPage - 1) * pageSize;
        const pageItems = historyItems.slice(start, start + pageSize);

        historySummary.innerHTML = historyItems.length
          ? `<span>${historyItems.length} movimenta${historyItems.length === 1 ? "&ccedil;&atilde;o" : "&ccedil;&otilde;es"} no hist&oacute;rico</span>`
          : "";
        historyList.innerHTML = pageItems.length
          ? pageItems.map(historyCard).join("")
          : "<p>Nenhuma movimenta\u00e7\u00e3o registrada ainda.</p>";
        renderHistoryPagination(historyPagination, historyItems.length, currentPage, pageSize, (pageNumber) => {
          currentPage = pageNumber;
          renderPage();
          historyList.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      };

      renderPage();
    } catch (error) {
      historyList.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
      historyPagination.innerHTML = "";
    }
  }

  function buildClientHistory(reservations, loans) {
    const reservationItems = reservations.map((item) => ({
      id: `reserva-${item.id}`,
      type: "Reserva",
      number: item.id,
      date: item.dataReserva,
      title: item.livro?.titulo || "Livro n\u00e3o informado",
      author: item.livro?.autor || "",
      detailLabel: item.status === "PENDENTE" ? "Prazo de retirada" : "Prazo encerrado",
      detailDate: item.prazoRetirada,
      status: item.status
    }));
    const loanItems = loans.map((item) => ({
      id: `emprestimo-${item.id}`,
      type: "Empr\u00e9stimo",
      number: item.id,
      date: item.dataEmprestimo,
      title: item.livro?.titulo || "Livro não informado",
      author: item.livro?.autor || "",
      detailLabel: item.status === "DEVOLVIDO" ? "Devolvido" : "Devolução prevista",
      detailDate: item.dataDevolucaoPrevista,
      status: item.status
    }));

    return [...reservationItems, ...loanItems]
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function historyCard(item) {
    const statusClass = getClientStatusClass(item.status);

    return `
      <article class="client-history-card">
        <div>
          <p class="eyebrow">${app.escapeHtml(item.type)} #${item.number}</p>
          <h3>${app.escapeHtml(item.title)}</h3>
          <p>${app.escapeHtml(item.author || "Autor não informado")}</p>
        </div>
        <div class="client-history-meta">
          <span><strong>Data</strong>${formatHistoryDate(item.date)}</span>
          <span><strong>${app.escapeHtml(item.detailLabel)}</strong>${formatHistoryDate(item.detailDate)}</span>
          <span class="status-chip ${statusClass}">${app.escapeHtml(historyStatusLabel(item.status))}</span>
        </div>
      </article>
    `;
  }

  function renderHistoryPagination(container, total, currentPage, pageSize, onChange) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (!total || totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, total);
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    container.innerHTML = `
      <span>Mostrando ${start}-${end} de ${total}</span>
      <div class="pagination compact-pagination">
        <button type="button" data-history-page="prev" ${currentPage === 1 ? "disabled" : ""}>‹</button>
        ${pages.map((pageNumber) => (
          `<button class="${pageNumber === currentPage ? "active" : ""}" type="button" data-history-page="${pageNumber}">${pageNumber}</button>`
        )).join("")}
        <button type="button" data-history-page="next" ${currentPage === totalPages ? "disabled" : ""}>›</button>
      </div>
    `;

    container.querySelectorAll("[data-history-page]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.historyPage;
        if (target === "prev") {
          onChange(Math.max(1, currentPage - 1));
          return;
        }
        if (target === "next") {
          onChange(Math.min(totalPages, currentPage + 1));
          return;
        }
        onChange(Number(target));
      });
    });
  }

  function historyStatusLabel(status) {
    const labels = {
      PENDENTE: "Reservado",
      ATIVO: "Ativo",
      ATRASADO: "Atrasado",
      DEVOLVIDO: "Devolvido",
      EXTRAVIADO: "Extraviado",
      CANCELADA: "Cancelado",
      EXPIRADA: "Expirado",
      RETIRADA_CONFIRMADA: "Retirado"
    };
    return labels[status] || status || "-";
  }

  function getClientStatusClass(status) {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "PENDENTE" || normalized === "RETIRADA_CONFIRMADA") return "reserved";
    if (normalized === "ATIVO") return "active";
    if (normalized === "DEVOLVIDO") return "progress";
    if (normalized === "CANCELADA" || normalized === "EXPIRADA") return "neutral";
    if (normalized === "ATRASADO" || normalized === "EXTRAVIADO") return "alert";
    return "neutral";
  }

  function formatHistoryDate(value) {
    return value ? app.formatDate(value) : "-";
  }

  function renderClosedReservations(reservations) {
    if (!reservations.length) {
      return "";
    }

    const visible = reservations.slice(0, 3);
    const hidden = reservations.slice(3);

    return `
      <section class="closed-reservations">
        <h2>Reservas encerradas</h2>
        <p class="closed-reservations-note">Quando o prazo de retirada termina, a reserva é encerrada e o livro volta ao catálogo.</p>
        <div class="stack-list">
          ${visible.map((item) => reservationCard(item, true)).join("")}
        </div>
        ${hidden.length ? `
          <details class="closed-reservations-more">
            <summary>Ver mais ${hidden.length} reserva(s) encerrada(s)</summary>
            <div class="stack-list">
              ${hidden.map((item) => reservationCard(item, true)).join("")}
            </div>
          </details>
        ` : ""}
      </section>
    `;
  }

  function reservationCard(item, isReservation) {
    const book = item.livro;
    const statusClass = getClientStatusClass(item.status);
    const action = isReservation && item.status === "PENDENTE"
      ? `<button class="button cancel" data-cancel-reservation="${item.id}" type="button">Cancelar reserva</button>`
      : "";
    const subtitle = isReservation
      ? item.status === "CANCELADA"
        ? `
          <div class="pickup-info">
            <img src="img/localização 1.svg" alt="">
            <div class="pickup-text">
              <strong>Prazo de retirada encerrado</strong>
              <span>O livro voltou ao catálogo em ${app.formatDate(item.prazoRetirada)}.</span>
            </div>
          </div>
        `
        : `
          <div class="pickup-info">
            <img src="img/localização 1.svg" alt="">
            <div class="pickup-text">
              <strong>Retirar na TechBook</strong>
              <span>Até ${app.formatDate(item.prazoRetirada)}</span>
            </div>
          </div>
        `
      : `
        <div class="pickup-info">
          <img class="date-icon" src="img/calendario 1.svg?v=3" alt="">
          <div class="pickup-text">
            <strong>Devolução prevista</strong>
            <span>${app.formatDate(item.dataDevolucaoPrevista)}</span>
            ${item.status === "ATIVO" && !item.renovado ? "<small>Renovação disponível presencialmente na TechBook.</small>" : ""}
            ${item.renovado ? "<small>Empréstimo já renovado uma vez.</small>" : ""}
          </div>
        </div>
      `;

    return `
      <article class="reservation-card">
        <img src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <div>
          <p class="eyebrow">${isReservation ? `Reserva #${item.id}` : `Empréstimo #${item.id}`}</p>
          <h3>${app.escapeHtml(book.titulo)}</h3>
          <p>${app.escapeHtml(book.autor)}</p>
          ${subtitle}
          <div class="book-actions">
            <span class="status-chip ${statusClass}">
              ${app.escapeHtml(historyStatusLabel(item.status))}
            </span>
            ${action}
          </div>
        </div>
      </article>
    `;
  }
})();
