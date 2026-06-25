# 📚 TECHBOOK - Sistema de Gerenciamento

> Plataforma web desenvolvida para facilitar a consulta, reserva e gerenciamento de livros, oferecendo uma experiência intuitiva para leitores e um controle completo do acervo para administradores.

---

## 🌐 Demonstração

### 🚀 **[Acesse a demonstração do TECHBOOK](https://gaabriellr415.github.io/PROJETO-TECHBOOK/)**

A demonstração apresenta o layout, a identidade visual e os principais fluxos de navegação da aplicação.

> **Observação:** esta versão foi criada para demonstrar a interface e a experiência do usuário. A versão completa, desenvolvida com **Java, Spring Boot, MySQL, autenticação, regras de negócio e integração com banco de dados**, permanece neste repositório.

---

## 🎨 Protótipo no Figma

Antes da implementação, todas as telas do sistema foram planejadas e prototipadas no Figma.

👉 **[Visualizar protótipo no Figma](**SEU_LINK_DO_FIGMA**https://www.figma.com/site/7iCM9ctJidk8yvNXhFxt7j/PROJETO---TECHBOOK?node-id=0-1&t=6PRVRA2CrZehJeaN-1)**


# 📚 TECHBOOK - Sistema de Gerenciamento

> Plataforma web desenvolvida para facilitar a consulta, reserva e gerenciamento de livros, oferecendo uma experiência intuitiva para leitores e um controle completo do acervo para administradores.

---

## 🔗 Links do Projeto

| Recurso | Acessar |
|---------|---------|
| 🌐 Demonstração | **[GitHub Pages](SEU_LINK)** |
| 🎨 Protótipo | **[Figma](SEU_LINK_DO_FIGMA)** |
| 📄 Documentação | **[`docs/`](docs/)** |

> A demonstração apresenta o layout, a identidade visual e os principais fluxos da aplicação. A versão completa, desenvolvida com **Java, Spring Boot e MySQL**, permanece neste repositório.

---


---

## 📖 Sobre o Projeto

O **TechBook** nasceu da dificuldade de acesso a determinadas obras e do alto custo dos livros, especialmente para estudantes e leitores frequentes.

A plataforma permite que os usuários consultem o acervo, reservem exemplares e acompanhem suas movimentações de forma simples e organizada, enquanto administradores controlam empréstimos, devoluções, atrasos e demais processos do acervo.

Mais do que um sistema de biblioteca, o TechBook busca incentivar a leitura, promover o reaproveitamento de livros e tornar o acesso ao conhecimento mais prático.

---

## 🎯 Objetivo

O projeto foi desenvolvido para solucionar um problema comum em bibliotecas e acervos físicos: facilitar o acesso aos livros e melhorar o controle de disponibilidade, reservas, empréstimos, devoluções, atrasos e histórico de movimentações.

O sistema possui dois perfis de acesso:

### 👤 Cliente

* Pesquisar livros
* Consultar disponibilidade
* Reservar exemplares
* Acompanhar reservas
* Consultar empréstimos
* Visualizar histórico

### 👨‍💼 Administrador

* Gerenciar usuários
* Gerenciar livros
* Registrar empréstimos
* Registrar devoluções
* Controlar atrasos
* Bloquear clientes
* Registrar extravios
* Acompanhar indicadores do sistema

---

## ✨ Principais Funcionalidades

* Cadastro e autenticação de usuários
* Catálogo de livros com busca por título, autor e categoria
* Reserva de livros disponíveis
* Controle do prazo para retirada
* Registro de empréstimos e devoluções
* Renovação de empréstimos
* Histórico completo de movimentações
* Dashboard administrativo
* Controle de atrasos e bloqueios
* Registro de extravio de livros
* Sugestão de livros semelhantes
* Listagem de livros mais reservados
* Recuperação de senha por e-mail

---

## 📋 Regras de Negócio

* Reserva disponível por **1 dia**
* Empréstimos com prazo inicial de **14 dias**
* Limite de **3 itens simultâneos** entre reservas e empréstimos
* Renovação permitida apenas **uma única vez**
* Clientes com atraso, bloqueio ou extravio não podem realizar novas reservas
* Retirada e devolução registradas presencialmente pelo administrador
* Histórico completo de reservas, empréstimos e devoluções

---

# 🛠 Tecnologias

| Frontend   | Backend         | Banco de Dados       | Design            | Ferramentas   |
| ---------- | --------------- | -------------------- | ----------------- | ------------- |
| HTML5      | Java 17         | MySQL                | Figma             | Git           |
| CSS3       | Spring Boot     | Modelagem Relacional | Adobe Photoshop   | GitHub        |
| JavaScript | Spring Data JPA | Scripts SQL          | Adobe Illustrator | IntelliJ IDEA |
|            | REST API        |                      | Adobe InDesign    | VS Code       |
|            | BCrypt          |                      | Draw.io           |               |

---

## 🏗 Arquitetura

O projeto foi desenvolvido utilizando uma arquitetura em camadas, separando responsabilidades entre apresentação, regras de negócio e persistência de dados.

Principais conceitos aplicados:

* Arquitetura em Camadas
* API REST
* Spring Data JPA
* DTO Pattern
* Camada de Serviço
* BCrypt para criptografia de senhas
* Tokens de autenticação
* Banco de dados relacional

---

## 🎨 Design e Experiência do Usuário

A interface foi planejada para ser simples, organizada e intuitiva.

Entre os principais elementos da experiência do usuário estão:

* Catálogo com capas dos livros
* Cards informativos
* Indicadores de disponibilidade
* Menus separados para clientes e administradores
* Formulários objetivos
* Dashboard administrativo
* Padronização visual das telas

Todo o protótipo foi desenvolvido inicialmente no **Figma**, enquanto **Photoshop** e **Illustrator** foram utilizados na criação da identidade visual.

---

## 📁 Estrutura do Projeto

```text
TECHBOOK
│
├── backend/          API REST em Java Spring Boot
├── frontend/         Interface da aplicação
├── database/         Scripts SQL e modelagem do banco
├── docs/             Diagramas, protótipos e documentação
└── README.md
```

---

## 📚 Documentação

A pasta **docs/** reúne toda a documentação técnica do projeto, incluindo:

* Diagramas UML
* DER e MER
* Casos de Uso
* Fluxo de Empréstimos
* Protótipos do Sistema
* Plano de Testes
* Política de Privacidade
* Regras de Negócio

---

## 🚀 O que este projeto demonstra

Durante o desenvolvimento foram aplicados conhecimentos de:

* Desenvolvimento Full Stack
* Java e Spring Boot
* APIs REST
* Modelagem de Banco de Dados
* Arquitetura em Camadas
* HTML, CSS e JavaScript
* Design de Interface
* Regras de Negócio
* Documentação Técnica
* Versionamento com Git e GitHub
