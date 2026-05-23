(function () {
  const app = window.TechBookApp;
  const page = document.body.dataset.page;
  let originalProfileValues = null;

  renderAuthArea();
  activateMenu();
  bindSupportForm();
  bindLoginForm();
  bindRecoverForm();
  bindStartSignup();
  bindSignupForm();
  renderAccountPage();
  renderFeaturedBooks();

// Monta a area do cabecalho conforme o usuario esteja logado ou nao.
function renderAuthArea() {
  const container = document.getElementById("authArea");
  if (!container) return;

  const session = app.getSession();

  if (!session) {
    container.innerHTML = `
      <a class="perfil" href="login.html">
        <img src="img/PERFIL 2.svg" alt="" class="login-icon">
        ENTRAR
      </a>
      <a class="primary" href="cadastro.html">Criar conta</a>
    `;
    return;
  }


const firstName = getFirstName(session.nome);

container.innerHTML = `
  <div class="profile-menu-wrap">

    <button class="profile-button" type="button" id="profileMenuButton">

      <img src="img/PERFIL 2.svg" alt="" class="user-avatar">

      <span>${app.escapeHtml(firstName)}</span>

    </button>

    <div class="profile-dropdown">

      <a href="minha-conta.html">
        <img src="img/PERFIL.svg" alt="">
        <span>Minha conta</span>
      </a>

      <a href="minhas-reservas.html">
        <img src="img/reserva de livro.svg" alt="">
        <span>Minhas reservas</span>
      </a>

      <button type="button" id="headerLogout">
        <img src="img/Sair 1.svg" alt="">
        <span>Sair</span>
      </button>

    </div>

  </div>
`;

document
  .getElementById("profileMenuButton")
  .addEventListener("click", () => {

    document
      .querySelector(".profile-menu-wrap")
      .classList.toggle("open");

});

  document.getElementById("headerLogout").addEventListener("click", () => {
    app.clearSession();
    window.location.href = "index.html";
  });
}

  // Mantem o cabecalho mais limpo exibindo apenas o primeiro nome.
  function getFirstName(fullName = "") {
    return fullName.trim().split(/\s+/)[0] || "Cliente";
  }

  function activateMenu() {
    const current = {
      home: "index.html",
      about: "quemsomos.html",
      catalog: "catalogo.html",
      book: "catalogo.html",
      how: "comofunciona.html",
      support: "suporte.html"
    }[page];

    if (!current) return;
    document.querySelectorAll(".site-nav a").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }
    });
  }

  async function renderFeaturedBooks() {
    if (page !== "home") return;
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;
    try {
      const livros = await app.request("/livros");
      if (!livros.length) {
        grid.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
        return;
      }
      grid.innerHTML = livros.slice(0, 3).map(cardTemplate).join("");
    } catch (error) {
      grid.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
    }
  }

  function cardTemplate(book) {
    return `
      <article class="book-card">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <h3>${app.escapeHtml(book.titulo)}</h3>
        <p>${app.escapeHtml(book.autor)}</p>
        <p>${app.escapeHtml(book.categoria)} • ${book.quantidadeDisponivel} disponível(eis)</p>
        <a class="button primary" href="livro.html?id=${book.id}">Ver detalhes</a>
      </article>
    `;
  }

// ==========================================
// FORMULÁRIO DE SUPORTE (EMAILJS)
// ==========================================

  function bindSupportForm() {
    const form = document.getElementById("supportForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("supportName").value;
      const email = document.getElementById("supportEmail").value;
      const topic = document.getElementById("supportTopic").value;
      const message = document.getElementById("supportMessage").value;

      const feedback = document.getElementById("supportFeedback");

    // ==========================================
    // VALIDAÇÃO
    // ==========================================

      if (!topic) {
        feedback.textContent = "Selecione o assunto.";
        feedback.style.color = "red";
        return;
      }

      // ==========================================
      // CONFIGURAÇÃO DO EMAILJS
      // ==========================================
      
        emailjs.init("gD86YoOWcfxgKD7xW"); // Public Key */

        const serviceID = "service_fnv1mq6";
        const templateID = "template_s6tckwd";

      // ==========================================
      // ENVIO DO E-MAIL
      // ==========================================

        emailjs.send(serviceID, templateID, {
          from_name: name,
          from_email: email,
          subject: topic,
          message: message
        })

    // ==========================================
    // SUCESSO NO ENVIO
    // ==========================================

        .then(() => {
          feedback.textContent = "Mensagem enviada com sucesso!";
          feedback.style.color = "green";
          form.reset();
        })

    // ==========================================
    // ERRO NO ENVIO
    // ==========================================
    
        .catch((error) => {
          console.error(error);

          feedback.textContent = "Erro ao enviar.";
          feedback.style.color = "red";
        });
    });
  }

  function bindLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value.trim();
      const feedback = document.getElementById("loginFeedback");

      if (!password) {
        feedback.textContent = "Informe a senha.";
        return;
      }

      try {
        const client = await app.request("/clientes/login", {
          method: "POST",
          body: {
            email,
            senha: password
          }
        });
        if (!client) {
          feedback.textContent = "Cliente não encontrado. Use um e-mail já cadastrado ou crie uma conta.";
          return;
        }

        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        window.location.href = "minhas-reservas.html";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function bindRecoverForm() {
    const form = document.getElementById("recoverForm");
    if (!form) return;

    const emailInput = document.getElementById("recoverEmail");
    const fields = document.getElementById("recoverPasswordFields");
    const newPasswordInput = document.getElementById("recoverNewPassword");
    const confirmPasswordInput = document.getElementById("recoverConfirmPassword");
    const submitButton = document.getElementById("recoverSubmitButton");
    const feedback = document.getElementById("recoverFeedback");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.textContent = "";
      feedback.classList.remove("success-feedback");
      feedback.classList.remove("error-feedback");

      const email = emailInput.value.trim().toLowerCase();
      if (!email) {
        feedback.textContent = "Informe o e-mail cadastrado.";
        feedback.classList.add("error-feedback");
        emailInput.focus();
        return;
      }

      if (fields.hidden) {
        fields.hidden = false;
        newPasswordInput.required = true;
        confirmPasswordInput.required = true;
        submitButton.textContent = "Redefinir senha";
        feedback.textContent = "Agora informe sua nova senha.";
        newPasswordInput.focus();
        return;
      }

      const novaSenha = newPasswordInput.value;
      const confirmarNovaSenha = confirmPasswordInput.value;

      if (novaSenha !== confirmarNovaSenha) {
        feedback.textContent = "As senhas não conferem. Digite a mesma senha nos dois campos.";
        feedback.classList.add("error-feedback");
        return;
      }

      try {
        await app.request("/clientes/recuperar-senha", {
          method: "PUT",
          body: {
            email,
            novaSenha,
            confirmarNovaSenha
          }
        });

        feedback.textContent = "Senha redefinida com sucesso. Voce sera levado para o login.";
        feedback.classList.add("success-feedback");
        submitButton.textContent = "Senha redefinida";
        submitButton.disabled = true;
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1800);
      } catch (error) {
        feedback.textContent = error.message;
        feedback.classList.add("error-feedback");
      }
    });
  }

async function renderAccountPage() {
  if (page !== "account") return;

  const root = document.getElementById("accountRoot");
  if (!root) return;

  const session = app.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  root.innerHTML = `
    <section class="reservation-layout">
      <aside class="profile-menu">
        <a class="active" href="minha-conta.html"><img src="img/PERFIL.svg" alt="">Seus dados</a>
        <a href="minhas-reservas.html"><img src="img/reserva de livro.svg" alt="">Minhas reservas</a>
        <button type="button" id="profileLogoutButton"><img src="img/Sair.svg" alt="">Sair</button>
      </aside>

      <section class="reservation-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Área do cliente</p>
            <h1>Seus dados</h1>
          </div>
        </div>

        <form id="profileForm" class="account-data-form account-overview">
          <div class="account-fields">
            <label>
              <span>Nome completo</span>
              <input type="text" id="profileName" placeholder="Nome completo" required>
            </label>
            <label>
              <span>CPF</span>
              <input type="text" id="profileCpf" placeholder="CPF" required>
            </label>
            <label>
              <span>E-mail</span>
              <input type="email" id="profileEmail" placeholder="E-mail" required>
            </label>
            <label>
              <span>Confirmar e-mail</span>
              <input type="email" id="profileEmailConfirm" placeholder="Confirmar e-mail" required>
            </label>
            <label>
              <span>Telefone</span>
              <input type="text" id="profilePhone" placeholder="DDD e número de telefone" required>
            </label>
          </div>

          <button class="button primary" type="submit">Salvar dados</button>
          <p class="feedback" id="profileFeedback"></p>
        </form>
      </section>
    </section>
  `;

  // Reorganiza os campos em dois grupos para refletir o layout definido no Figma.
  const form = document.getElementById("profileForm");
  const fields = form.querySelector(".account-fields");
  const labels = [...fields.querySelectorAll("label")];
  const personalGroup = document.createElement("section");
  const accessGroup = document.createElement("section");
  const actions = form.querySelector(".button.primary");

  personalGroup.className = "account-group personal-group";
  personalGroup.innerHTML = "<h2>Dados pessoais</h2><div class=\"account-fields personal-fields\"></div>";
  accessGroup.className = "account-group access-group";
  accessGroup.innerHTML = "<h2>Dados de acesso</h2><div class=\"account-fields access-fields\"></div>";

  [labels[0], labels[1], labels[4]].forEach((label) => personalGroup.querySelector(".personal-fields").appendChild(label));
  accessGroup.querySelector(".access-fields").appendChild(labels[2]);
  labels[3].classList.add("hidden-confirm-email");
  accessGroup.appendChild(labels[3]);

  fields.replaceWith(personalGroup, accessGroup);
  actions.textContent = "Salvar";
  actions.classList.add("hidden-action");
  personalGroup.insertAdjacentHTML("beforeend", '<div class="profile-actions-row"></div>');
  const profileActionsRow = personalGroup.querySelector(".profile-actions-row");
  profileActionsRow.appendChild(actions);
  profileActionsRow.insertAdjacentHTML("beforeend", '<button class="button ghost hidden-action cancel-profile-button" id="cancelProfileButton" type="button">Cancelar</button>');
  personalGroup.insertAdjacentHTML("beforeend", '<button class="button secondary edit-profile-button" id="editProfileButton" type="button">Editar dados</button>');
  accessGroup.insertAdjacentHTML("beforeend", `
    <div class="access-actions-row">
      <button class="button primary" id="changeEmailButton" type="button">Alterar e-mail</button>
      <button class="button primary" id="changePasswordButton" type="button">Alterar senha</button>
    </div>
    <form id="passwordChangeForm" class="password-change-form hidden-action">
      <label>
        <span>Senha atual</span>
        <input type="password" id="currentPassword" required>
      </label>
      <label>
        <span>Nova senha</span>
        <input type="password" id="newPassword" minlength="6" required>
      </label>
      <label>
        <span>Confirmar nova senha</span>
        <input type="password" id="confirmNewPassword" minlength="6" required>
      </label>
      <div class="password-actions-row">
        <button class="button primary" type="submit">Salvar senha</button>
        <button class="button ghost" id="cancelPasswordButton" type="button">Cancelar</button>
      </div>
    </form>
  `);
  form.querySelectorAll("label").forEach((label) => label.classList.add("account-field-card"));
  setProfileEditing(false);

  document.getElementById("profileLogoutButton").addEventListener("click", () => {
    app.clearSession();
    window.location.href = "index.html";
  });

  try {
    const client = await app.request(`/clientes/${session.id}`);

    document.getElementById("profileName").value = client.nome || "";
    document.getElementById("profileCpf").value = formatCpf(client.cpf || "");
    document.getElementById("profileEmail").value = client.email || "";
    document.getElementById("profileEmailConfirm").value = client.email || "";
    document.getElementById("profilePhone").value = formatPhone(client.telefone || "");
    originalProfileValues = {
      nome: client.nome || "",
      cpf: formatCpf(client.cpf || ""),
      email: client.email || "",
      telefone: formatPhone(client.telefone || "")
    };

    bindProfileForm(session.id);
    bindEditProfileAction();
    bindCancelProfileAction();
    bindEmailAction();
    bindPasswordAction(session.id);
  } catch (error) {
    document.getElementById("profileFeedback").textContent = error.message;
  }
}


  function bindSignupForm() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    const emailFromPreviousStep = new URLSearchParams(window.location.search).get("email");
    if (emailFromPreviousStep) {
      document.getElementById("signupEmail").value = emailFromPreviousStep;
      document.getElementById("signupEmailConfirm").value = emailFromPreviousStep;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("signupEmail").value.trim();
      const emailConfirm = document.getElementById("signupEmailConfirm").value.trim();
      const feedback = document.getElementById("signupFeedback");

      if (email !== emailConfirm) {
        feedback.textContent = "Os e-mails precisam ser iguais.";
        return;
      }

      const senha = document.getElementById("signupPassword").value;
      const confirmarSenha = document.getElementById("signupPasswordConfirm").value;

      if (senha !== confirmarSenha) {
        feedback.textContent = "As senhas precisam ser iguais.";
        feedback.style.color = "red";
        return;
      }


      const payload = {
        nome: document.getElementById("signupName").value.trim(),
        cpf: digitsOnly(document.getElementById("signupCpf").value),
        email,
        telefone: digitsOnly(document.getElementById("signupPhone").value),
        senha: senha
      };

      try {
        const client = await app.request("/clientes", { method: "POST", body: payload });
        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        window.location.href = "minhas-reservas.html";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function bindProfileForm(clientId) {
    const form = document.getElementById("profileForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("profileEmail").value.trim();
      const emailConfirm = document.getElementById("profileEmailConfirm").value.trim();
      const feedback = document.getElementById("profileFeedback");

      if (email !== emailConfirm) {
        feedback.textContent = "Os e-mails precisam ser iguais.";
        return;
      }

      const payload = {
        nome: document.getElementById("profileName").value.trim(),
        cpf: digitsOnly(document.getElementById("profileCpf").value),
        email,
        telefone: digitsOnly(document.getElementById("profilePhone").value)
      };

      try {
        const client = await app.request(`/clientes/${clientId}`, { method: "PUT", body: payload });
        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        feedback.textContent = "Dados atualizados com sucesso.";
        feedback.classList.add("success-feedback");
        originalProfileValues = {
          nome: client.nome || "",
          cpf: formatCpf(client.cpf || ""),
          email: client.email || "",
          telefone: formatPhone(client.telefone || "")
        };
        setProfileEditing(false);
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function bindPasswordAction(clientId) {
    const button = document.getElementById("changePasswordButton");
    const form = document.getElementById("passwordChangeForm");
    const cancelButton = document.getElementById("cancelPasswordButton");
    const feedback = document.getElementById("profileFeedback");
    if (!button || !form || !feedback) return;

    button.addEventListener("click", () => {
      form.classList.remove("hidden-action");
      button.classList.add("hidden-action");
      document.getElementById("currentPassword").focus();
      feedback.textContent = "";
    });

    cancelButton.addEventListener("click", () => {
      form.reset();
      form.classList.add("hidden-action");
      button.classList.remove("hidden-action");
      feedback.textContent = "";
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.classList.remove("success-feedback");

      const senhaAtual = document.getElementById("currentPassword").value;
      const novaSenha = document.getElementById("newPassword").value;
      const confirmarNovaSenha = document.getElementById("confirmNewPassword").value;

      if (novaSenha !== confirmarNovaSenha) {
        feedback.textContent = "A nova senha e a confirmação precisam ser iguais.";
        return;
      }

      try {
        await app.request(`/clientes/${clientId}/senha`, {
          method: "PUT",
          body: {
            senhaAtual,
            novaSenha,
            confirmarNovaSenha
          }
        });
        feedback.textContent = "Senha atualizada com sucesso.";
        feedback.classList.add("success-feedback");
        form.reset();
        form.classList.add("hidden-action");
        button.classList.remove("hidden-action");
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function bindEditProfileAction() {
    const button = document.getElementById("editProfileButton");
    if (!button) return;

    button.addEventListener("click", () => {
      setProfileEditing(true);
    });
  }

  function bindCancelProfileAction() {
    const button = document.getElementById("cancelProfileButton");
    const feedback = document.getElementById("profileFeedback");
    if (!button) return;

    button.addEventListener("click", () => {
      if (originalProfileValues) {
        document.getElementById("profileName").value = originalProfileValues.nome;
        document.getElementById("profileCpf").value = originalProfileValues.cpf;
        document.getElementById("profileEmail").value = originalProfileValues.email;
        document.getElementById("profileEmailConfirm").value = originalProfileValues.email;
        document.getElementById("profilePhone").value = originalProfileValues.telefone;
      }
      if (feedback) {
        feedback.textContent = "";
      }
      setProfileEditing(false);
    });
  }

  function setProfileEditing(isEditing) {
    const editableInputs = ["profileName", "profileCpf", "profileEmail", "profileEmailConfirm", "profilePhone"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const saveButton = document.querySelector(".profile-actions-row .button.primary");
    const editButton = document.getElementById("editProfileButton");
    const cancelButton = document.getElementById("cancelProfileButton");
    const confirmEmailField = document.getElementById("profileEmailConfirm")?.closest("label");

    editableInputs.forEach((input) => {
      input.readOnly = !isEditing;
    });

    if (saveButton) {
      saveButton.classList.toggle("hidden-action", !isEditing);
    }
    if (editButton) {
      editButton.classList.toggle("hidden-action", isEditing);
    }
    if (cancelButton) {
      cancelButton.classList.toggle("hidden-action", !isEditing);
    }
    if (confirmEmailField) {
      confirmEmailField.classList.toggle("hidden-confirm-email", !isEditing);
    }
  }

  function bindEmailAction() {
    const button = document.getElementById("changeEmailButton");
    const feedback = document.getElementById("profileFeedback");
    if (!button || !feedback) return;

    button.addEventListener("click", () => {
      feedback.textContent = "";
      setProfileEditing(true);
      document.getElementById("profileEmail")?.focus();
    });
  }

})();

// Mostra ou oculta a senha
function togglePassword(button) {
  const group = button.closest(".password-group");
  const input = group.querySelector("input");
  const icon = button.querySelector("img");

  if (input.type === "password") {
    input.type = "text";
    icon.src = "img/olho-aberto.svg";
    icon.alt = "Ocultar senha";
  } else {
    input.type = "password";
    icon.src = "img/olho-fechado.svg";
    icon.alt = "Mostrar senha";
  }
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCpf(value) {
  const digits = digitsOnly(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
}

function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function bindStartSignup() {
  const button = document.getElementById("startSignupButton");
  const emailInput = document.getElementById("signupEmailLogin");
  if (!button || !emailInput) return;

  button.addEventListener("click", (event) => {
    const email = emailInput.value.trim();
    if (!email) {
      event.preventDefault();
      emailInput.focus();
      return;
    }

    button.href = `cadastro.html?email=${encodeURIComponent(email)}`;
  });
}

function applyMask(id, formatter) {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("input", function () {
    this.value = formatter(this.value);
  });
}

applyMask("signupCpf", formatCpf);
applyMask("signupPhone", formatPhone);
applyMask("profileCpf", formatCpf);
applyMask("profilePhone", formatPhone);
