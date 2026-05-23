(function () {

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


  // ==========================================
  // DETALHES DO LIVRO
  // ==========================================

  async function initBookDetail() {
    const detail = document.getElementById("bookDetail");
    const bookId = new URLSearchParams(window.location.search).get("id");
    const session = app.getSession();
    let book;
    let reservations = [];

    try {
      book = await app.request(`/livros/${bookId}`);
      reservations = session ? await app.request(`/clientes/${session.id}/reservas`) : [];
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
                  <img src="img/disponivel.svg" alt="" class="book-info-icon">
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
          app.setFlashMessage("Reserva criada com sucesso. Agora voce pode acompanhar o prazo de retirada.");
          window.location.reload();
        } catch (error) {
          reserveButton.disabled = false;
          reserveButton.textContent = "Reservar";
          alert(error.message);
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
          app.setFlashMessage("Reserva cancelada. O livro voltou a ficar disponivel para novas reservas.");
          window.location.href = "minhas-reservas.html";
        } catch (error) {
          cancelButton.disabled = false;
          cancelButton.textContent = "Cancelar reserva";
          alert(error.message);
        }
      });
    }
  }

  function renderReservationButtons(book, reservation, pendingReservationCount) {
    // O CTA muda conforme sessao, estoque e existencia de reserva pendente para o mesmo livro.
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
      : '<span class="status-chip neutral">Reservas indisponiveis no momento</span>';
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
    const loanList = document.getElementById("loanList");
    const logoutButton = document.getElementById("logoutButton");
    const flash = app.consumeFlashMessage();

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    try {
      const reservations = await app.request(`/clientes/${session.id}/reservas`);
      const loans = await app.request(`/clientes/${session.id}/emprestimos`);
      const activeReservations = reservations.filter((item) => item.status === "PENDENTE");

      reservationList.innerHTML = `
        ${flash ? `<div class="inline-feedback ${app.escapeHtml(flash.type)}">${app.escapeHtml(flash.message)}</div>` : ""}
        ${activeReservations.length ? activeReservations.map((item) => reservationCard(item, true)).join("") : "<p>Nenhuma reserva ativa no momento.</p>"}
      `;

      loanList.innerHTML = `
        <h2>Empréstimos</h2>
        ${loans.length ? loans.map((item) => reservationCard(item, false)).join("") : "<p>Nenhum empréstimo ativo para este cliente.</p>"}
      `;

      reservationList.querySelectorAll("[data-cancel-reservation]").forEach((button) => {
        button.addEventListener("click", async () => {
          await app.request(`/reservas/${button.dataset.cancelReservation}/cancelar`, { method: "PATCH" });
          window.location.reload();
        });
      });
    } catch (error) {
      reservationList.innerHTML = `<h2>Reservas</h2><p>${app.escapeHtml(error.message)}</p>`;
      loanList.innerHTML = `<h2>Empréstimos</h2><p>${app.escapeHtml(error.message)}</p>`;
    }
  }

  function reservationCard(item, isReservation) {
    const book = item.livro;
    const statusClass = item.status === "PENDENTE"
      ? "success"
      : item.status === "ATRASADO" || item.status === "CANCELADA"
        ? "alert"
        : "neutral";
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
              <span>${app.formatDate(item.prazoRetirada)}</span>
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
          <img src="img/localização 1.svg" alt="">
          <div class="pickup-text">
            <strong>Devolução prevista</strong>
            <span>${app.formatDate(item.dataDevolucaoPrevista)}</span>
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
              ${item.status === "PENDENTE" ? "Reservado" : app.escapeHtml(item.status)}
            </span>
            ${action}
          </div>
        </div>
      </article>
    `;
  }
})();
