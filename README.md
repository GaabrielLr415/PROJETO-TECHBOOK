````markdown
# TECHBOOK - SISTEMA DE GERENCIAMENTO

TechBook é uma plataforma web desenvolvida para facilitar a consulta, reserva e gerenciamento de livros, oferecendo uma experiência simples para leitores e um controle completo do acervo para administradores.

## 🌐 Demonstração

### 👉 [Acessar demonstração do TECHBOOK](https://gaabriellr415.github.io/PROJETO-TECHBOOK/)

A demonstração apresenta a interface, a identidade visual e os principais fluxos de navegação da aplicação.

A versão completa, desenvolvida em Java, Spring Boot e MySQL, permanece neste repositório.

## Sobre o Projeto

O TechBook nasceu da dificuldade de acesso a determinadas obras e do alto custo dos livros, especialmente para estudantes e leitores frequentes.

A plataforma permite que os clientes consultem o acervo, reservem livros e acompanhem suas movimentações, enquanto administradores controlam o acervo, confirmam retiradas, registram devoluções e gerenciam pendências.

Mais do que um sistema de biblioteca, o TechBook busca incentivar a leitura, apoiar o reaproveitamento de livros e tornar o acesso ao conhecimento mais prático.

## Para Quem Foi Feito

### Cliente

- Pesquisar livros
- Consultar disponibilidade
- Reservar exemplares
- Acompanhar reservas e empréstimos
- Consultar histórico

### Administrador

- Gerenciar livros e usuários
- Confirmar retiradas
- Registrar empréstimos e devoluções
- Controlar atrasos, bloqueios e extravios
- Acompanhar indicadores do acervo

## Principais Funcionalidades

- ✅ Cadastro e login de clientes
- ✅ Catálogo de livros com busca por título, autor e categoria
- ✅ Reserva de livros disponíveis
- ✅ Controle de prazo para retirada da reserva
- ✅ Registro de empréstimos e devoluções
- ✅ Renovação de empréstimo conforme regra do sistema
- ✅ Histórico do cliente com reservas, empréstimos e devoluções
- ✅ Painel administrativo com indicadores do acervo
- ✅ Controle de atrasos, bloqueios de clientes e extravio de livros
- ✅ Sugestão de livros semelhantes
- ✅ Listagem de livros mais reservados
- ✅ Recuperação de senha por e-mail quando o SMTP estiver configurado

## Regras de Negócio

- A reserva fica disponível para retirada por 1 dia
- O empréstimo tem prazo inicial de 14 dias
- Cada cliente pode ter até 3 itens simultâneos entre reservas pendentes e empréstimos ativos
- O empréstimo pode ser renovado uma única vez
- Clientes com atraso, bloqueio ou extravio ficam impedidos de realizar novas reservas
- O administrador registra a retirada e a devolução presencialmente
- O sistema preserva o histórico de reservas, empréstimos e devoluções

## Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- API REST
- BCrypt

### Banco de Dados

- MySQL
- Modelagem relacional
- Scripts SQL

### Ferramentas de Apoio

- Git
- GitHub
- Figma
- Adobe Photoshop
- Adobe Illustrator
- Draw.io
- Visual Studio Code
- IntelliJ IDEA

## Arquitetura

- Arquitetura em camadas
- API REST
- DTOs para entrada e saída de dados
- Regras de negócio centralizadas em camada de serviço
- Spring Data JPA para persistência
- BCrypt para proteção de senhas
- Tokens de sessão para rotas protegidas
- Banco de dados relacional com MySQL

## Design e Experiência do Usuário

A interface foi planejada para ser simples, organizada e fácil de navegar. O design utiliza uma identidade visual voltada para tecnologia, confiabilidade e leitura.

Entre os principais pontos da interface estão:

- Catálogo com capas dos livros
- Cards com informações resumidas
- Indicadores de disponibilidade
- Menus separados para cliente e administrador
- Formulários objetivos
- Painel administrativo com dados importantes para gestão
- Padronização visual entre as telas

O processo de design também fez parte da construção do projeto. O Figma foi utilizado para estruturar o protótipo e organizar as telas antes da implementação. O Photoshop apoiou o tratamento das imagens, enquanto o Illustrator foi utilizado na vetorização de elementos gráficos da identidade visual.

## Estrutura do Projeto

```text
backend/       API REST em Java Spring Boot
frontend/      Interface da aplicação
database/      Scripts SQL e modelagem do banco
docs/          Documentação técnica do projeto
````

## Documentação

A documentação técnica está disponível na pasta `docs/`, incluindo:

* Diagramas UML
* DER e MER
* Fluxos do sistema
* Regras de negócio
* Protótipos desenvolvidos no Figma
* Plano de testes
* Política de privacidade
* Materiais de apoio

## O Que Este Projeto Demonstra

Este projeto demonstra prática em:

* Desenvolvimento Full Stack
* Java e Spring Boot
* APIs REST
* Modelagem de banco de dados
* Regras de negócio
* Arquitetura em camadas
* HTML, CSS e JavaScript
* Design de interface
* Documentação técnica
* Versionamento com Git e GitHub

```
```
