# Mapeamento de conformidade da TECHBOOK

Este arquivo relaciona as telas e regras da documentação com a implementação atual.

## Telas do protótipo

| Tela documentada | Arquivo implementado | Status |
| --- | --- | --- |
| Página inicial | `frontend/index.html` | Conforme |
| Login e cadastramento | `frontend/login.html` e `frontend/cadastro.html` | Conforme |
| Cadastramento do usuário | `frontend/cadastro.html` | Conforme |
| Quem somos | `frontend/quemsomos.html` | Conforme |
| Catálogo | `frontend/catalogo.html` | Conforme |
| Reservar livro | `frontend/livro.html` | Conforme |
| Livro reservado | `frontend/minhas-reservas.html` | Conforme |
| Minhas reservas | `frontend/minhas-reservas.html` | Conforme |
| Como funciona | `frontend/comofunciona.html` | Conforme |
| Suporte | `frontend/suporte.html` | Conforme |
| Dashboard | `frontend/adm.html` | Conforme |
| Confirmar retirada | `frontend/adm-reservas.html` | Conforme |
| Empréstimos ativos | `frontend/adm-emprestimo.html` | Conforme |
| Registrar devolução | `frontend/adm-devolucao.html` | Conforme |
| Empréstimos atrasados | `frontend/adm-atrasos.html` | Conforme |
| Livros e estoque | `frontend/adm-livros.html` | Conforme |
| Clientes | `frontend/adm-usuarios.html` | Conforme |
| Cadastrar livro | `frontend/adm-livros.html` | Conforme |
| Política de privacidade | `frontend/docs/politica-privacidade.pdf` | Adicionado |

## Decisões de implementação

- O administrador usa credencial fixa no backend: `admin@techbook.local` / `123456`.
- A documentação menciona uma entidade Administrador, mas esta versão não usa tabela separada de administradores.
- Reservas vencidas são marcadas como `EXPIRADA`, alinhando com a regra de expiração automática.
- O limite de 3 considera reservas pendentes e empréstimos ainda não devolvidos.
- Cliente com empréstimo atrasado ou extraviado fica bloqueado para novas reservas e retiradas.
- O registro de contato e o extravio ficam concentrados em `Empréstimos atrasados`.
- Livro extraviado reduz o total do acervo; devolução posterior restaura o exemplar.

## Melhorias futuras e riscos mapeados

- Login com vários administradores e níveis de permissão.
- Auditoria completa para registrar quem confirmou retirada, registrou devolução, marcou extravio ou alterou estoque.
- Backup automático do banco de dados para reduzir risco de perda de informações.
- Filtros avançados por mês, ano, status, cliente, livro e tipo de movimentação.
- Relatórios mensais e anuais para acompanhamento de reservas, empréstimos, devoluções e atrasos.
- Sugestão inteligente de livros semelhantes quando uma obra estiver indisponível.

## Testes automatizados

Os cenários do plano de testes estão cobertos em `backend/src/test/java/com/techbook/TechbookApplicationTests.java`:

- Pesquisa de livro.
- Reserva de livro disponível.
- Cancelamento automático de reserva vencida.
- Registro de empréstimo.
- Limite de 3 empréstimos por cliente.
- Registro de devolução.
- Renovação única de empréstimo.
- Verificação de atraso.
- Bloqueio de cliente com pendência crítica.
- Registro de extravio e restauração do acervo quando o livro é devolvido.
