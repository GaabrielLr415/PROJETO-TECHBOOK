# TECHBOOK - SISTEMA DE GERENCIAMENTO

TechBook e uma plataforma web criada para aproximar estudantes e leitores do acesso a livros de forma simples, organizada e digital.

A ideia do projeto nasceu da dificuldade de acesso a determinadas obras e do alto custo dos livros, especialmente para quem estuda ou le com frequencia. A proposta e permitir que o usuario consulte o acervo, reserve exemplares e acompanhe suas movimentacoes pela tela, enquanto a retirada e a devolucao continuam presenciais para manter o controle fisico dos livros.

Mais do que um sistema de biblioteca, o TechBook busca incentivar a leitura, apoiar o reaproveitamento de livros e tornar o acesso ao conhecimento mais pratico.

## Objetivo Do Projeto

O objetivo do TechBook e resolver um problema comum em bibliotecas e acervos fisicos: facilitar o acesso dos leitores aos livros e, ao mesmo tempo, melhorar o controle de disponibilidade, reservas, retiradas, devolucoes, atrasos e historico de movimentacoes.

A proposta e permitir que o cliente consulte livros e realize reservas de forma simples, enquanto o administrador acompanha o acervo, confirma retiradas, registra devolucoes e gerencia pendencias.

## Para Quem Foi Feito

O sistema foi pensado para dois perfis principais:

- Clientes que desejam pesquisar livros, consultar disponibilidade, reservar exemplares e acompanhar seu historico.
- Administradores que precisam controlar livros, usuarios, emprestimos, devolucoes, atrasos, bloqueios e extravios.

## Principais Funcionalidades

- Cadastro e login de clientes.
- Catalogo de livros com busca por titulo, autor e categoria.
- Reserva de livros disponiveis.
- Controle de prazo para retirada da reserva.
- Registro de emprestimos e devolucoes.
- Renovacao de emprestimo conforme regra do sistema.
- Historico do cliente com reservas, emprestimos e devolucoes.
- Painel administrativo com indicadores do acervo.
- Controle de atrasos, bloqueios de clientes e extravio de livros.
- Sugestao de livros semelhantes.
- Listagem de livros mais reservados.
- Recuperacao de senha por e-mail quando o SMTP estiver configurado.

## Regras De Negocio

- A reserva fica disponivel para retirada por 1 dia.
- O emprestimo tem prazo inicial de 14 dias.
- Cada cliente pode ter ate 3 itens simultaneos entre reservas pendentes e emprestimos ativos.
- O emprestimo pode ser renovado uma unica vez.
- Clientes com atraso, bloqueio ou extravio ficam impedidos de realizar novas reservas.
- O administrador registra a retirada e a devolucao presencialmente.
- O sistema preserva o historico de reservas, emprestimos e devolucoes.

## Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Organizacao de telas por fluxo de usuario
- Componentes visuais para catalogo, cards de livros, formularios e painel administrativo

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- API REST
- DTOs para entrada e saida de dados
- Regras de negocio centralizadas em camada de servico
- BCrypt para protecao de senhas
- Tokens de sessao para rotas protegidas

### Banco De Dados

- MySQL
- Modelagem relacional
- Scripts SQL para criacao e preparacao do banco
- Relacionamentos entre usuarios, administradores, livros, reservas, emprestimos e devolucoes

### Ferramentas De Apoio

- Git e GitHub
- Figma
- Adobe Photoshop
- Adobe Illustrator
- Draw.io
- Visual Studio Code
- IntelliJ IDEA

## Design E Experiencia Do Usuario

A interface foi planejada para ser simples, organizada e facil de navegar. O design usa uma identidade visual voltada para tecnologia, confiabilidade e leitura, com destaque para:

- catalogo com capas dos livros;
- cards com informacoes resumidas;
- indicadores de disponibilidade;
- menus separados para cliente e administrador;
- formularios objetivos;
- painel administrativo com dados importantes para gestao;
- padronizacao visual entre as telas.

O processo de design tambem fez parte da construcao do projeto. O Figma foi usado para estruturar o prototipo e organizar as telas antes da implementacao. O Photoshop apoiou o tratamento das imagens, enquanto o Illustrator foi utilizado na vetorizacao de elementos graficos da identidade visual.

## O Que Este Projeto Demonstra

Este projeto demonstra pratica em desenvolvimento full stack, integrando frontend, backend e banco de dados em um fluxo completo. Tambem mostra aplicacao de regras de negocio, organizacao de codigo, modelagem de dados, controle de estado no frontend, design de interface e preocupacao com seguranca basica, usabilidade e documentacao.

## Estrutura Do Projeto

```text
backend/       API Java Spring Boot
frontend/      Telas HTML, CSS e JavaScript
database/      Scripts do banco de dados
frontend/docs/ Documentacao do projeto
```

## Documentacao

A documentacao completa do projeto esta em `frontend/docs/`, incluindo diagramas, politica de privacidade, regras do sistema, fluxo de emprestimo e materiais de apoio.
