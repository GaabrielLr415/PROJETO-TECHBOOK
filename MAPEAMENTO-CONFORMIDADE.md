# Mapeamento de conformidade da TECHBOOK

Este arquivo relaciona as telas e regras da documentacao com a implementacao atual.

## Telas do prototipo

| Tela documentada | Arquivo implementado | Status |
| --- | --- | --- |
| Pagina inicial | `frontend/index.html` | Conforme |
| Login e cadastramento | `frontend/login.html` e `frontend/cadastro.html` | Conforme |
| Cadastramento do usuario | `frontend/cadastro.html` | Conforme |
| Quem somos | `frontend/quemsomos.html` | Conforme |
| Catalogo | `frontend/catalogo.html` | Conforme |
| Reservar livro | `frontend/livro.html` | Conforme |
| Livro reservado | `frontend/minhas-reservas.html` | Conforme |
| Minhas reservas | `frontend/minhas-reservas.html` | Conforme |
| Como funciona | `frontend/comofunciona.html` | Conforme |
| Suporte | `frontend/suporte.html` | Conforme |
| Dashboard | `frontend/adm.html` | Conforme |
| Registrar emprestimo | `frontend/adm-emprestimo.html` | Conforme |
| Registrar devolucao | `frontend/adm-devolucao.html` | Conforme |
| Verificar atrasos | `frontend/adm-atrasos.html` | Conforme |
| Consultar livro | `frontend/adm-livros.html` | Conforme |
| Consultar usuarios | `frontend/adm-usuarios.html` | Conforme |
| Gerenciar livro | `frontend/adm-gerenciar-livro.html` | Conforme |

## Decisoes de implementacao

- O administrador usa credencial fixa no backend: `admin@techbook.local` / `123456`.
- A documentacao menciona uma entidade Administrador, mas esta versao nao usa tabela separada de administradores.
- Reservas vencidas sao marcadas como `CANCELADA`, alinhando com o texto da documentacao.
- O limite de 3 considera emprestimos ainda nao devolvidos, conforme a regra documentada.

## Testes automatizados

Os cenarios do plano de testes estao cobertos em `backend/src/test/java/com/techbook/TechbookApplicationTests.java`:

- Pesquisa de livro.
- Reserva de livro disponivel.
- Cancelamento automatico de reserva vencida.
- Registro de emprestimo.
- Limite de 3 emprestimos por cliente.
- Registro de devolucao.
- Renovacao unica de emprestimo.
- Verificacao de atraso.
