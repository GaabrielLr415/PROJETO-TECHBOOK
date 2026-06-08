# Guia De Controle Do Projeto TechBook

Este arquivo serve como mapa rapido para a equipe entender, revisar e manter o projeto.
Ele nao substitui os comentarios do codigo, mas mostra onde cada parte importante fica.

## Visao Geral

O TechBook e um sistema de biblioteca com:

- catalogo de livros para o cliente;
- cadastro e login de clientes;
- reserva de livros;
- consulta de reservas, emprestimos e historico do cliente;
- painel administrativo;
- controle de retirada, emprestimo, renovacao, atraso, devolucao e extravio;
- dashboard administrativo com indicadores;
- vitrine de livros mais reservados;
- sugestao de livros semelhantes;
- banco MySQL com livros, usuarios, reservas, emprestimos e devolucoes.

## Documentacao Aprovada E Atualizacoes

A documentacao entregue e aprovada deve ser preservada como base do projeto.

As melhorias criadas depois da aprovacao ficam registradas em:

```text
docs/ATUALIZACOES-POS-APROVACAO.md
```

Esse arquivo funciona como adendo: ele explica o que foi acrescentado, por que foi acrescentado e quais arquivos foram alterados.

## Como O Projeto Esta Dividido

```text
TECHFORCE - FINAL/
  backend/      API Java Spring Boot
  frontend/     Telas HTML, CSS e JavaScript
  database/     Script SQL do banco techbook
  docs/         Documentos do projeto
```

## Backend

O backend fica em `backend/src/main/java/com/techbook`.

### Arquivo Central

`service/TechbookService.java`

Este e o arquivo mais importante do backend. Ele concentra as regras de negocio:

- login do administrador;
- cadastro e login de cliente;
- cadastro, edicao e exclusao de livros;
- listagem do catalogo;
- calculo de livros mais procurados;
- criacao e cancelamento de reservas;
- expiracao automatica de reservas vencidas;
- confirmacao de retirada;
- criacao de emprestimo;
- renovacao de emprestimo;
- registro de contato em atraso;
- marcacao de extravio;
- registro de devolucao;
- calculo do dashboard administrativo;
- bloqueio e desbloqueio de cliente.

Sempre que uma regra mudar, este e o primeiro arquivo a conferir.

### Controllers

Os controllers recebem as chamadas do frontend e chamam o `TechbookService`.

| Arquivo | Responsabilidade |
| --- | --- |
| `LivroController.java` | Rotas de livros, catalogo e livros mais procurados |
| `UsuarioController.java` | Rotas de cliente, login, cadastro e senha |
| `ReservaController.java` | Criar, listar e cancelar reservas |
| `EmprestimoController.java` | Retirada, emprestimos, renovacao, atraso, extravio e devolucao |
| `AdministracaoController.java` | Login admin e dashboard |

### Models

Os models representam as tabelas do banco:

| Arquivo | Tabela |
| --- | --- |
| `Livro.java` | `livros` |
| `Usuario.java` | `usuarios` |
| `Reserva.java` | `reservas` |
| `Emprestimo.java` | `emprestimos` |
| `Devolucao.java` | `devolucoes` |

### DTOs

Os arquivos em `dto/` definem o formato dos dados que entram e saem da API.
Eles evitam que o frontend dependa diretamente dos models do banco.

### Repositories

Os arquivos em `repository/` fazem o acesso ao banco usando Spring Data JPA.
Normalmente eles nao tem regra de negocio.

## Frontend

O frontend fica em `frontend/`.

### JavaScript Principal

| Arquivo | Responsabilidade |
| --- | --- |
| `frontend/js/app.js` | Comunicacao com API, sessao, login, normalizacao dos dados e funcoes globais |
| `frontend/js/catalogo.js` | Catalogo, detalhe do livro, reserva, minhas reservas, emprestimos e historico do cliente |
| `frontend/js/adm.js` | Painel administrativo, dashboard, reservas, emprestimos, usuarios, livros, atrasos e devolucoes |
| `frontend/js/script.js` | Comportamentos gerais da home e paginas institucionais |

### Telas Do Cliente

| Tela | Arquivo |
| --- | --- |
| Inicio | `frontend/index.html` |
| Catalogo | `frontend/catalogo.html` |
| Detalhe do livro | `frontend/livro.html` |
| Login | `frontend/login.html` |
| Cadastro | `frontend/cadastro.html` |
| Recuperar senha | `frontend/recuperar-senha.html` |
| Minha conta | `frontend/minha-conta.html` |
| Minhas reservas | `frontend/minhas-reservas.html` |
| Meus emprestimos | `frontend/meus-emprestimos.html` |
| Meu historico | `frontend/meu-historico.html` |
| Suporte | `frontend/suporte.html` |
| Quem somos | `frontend/quemsomos.html` |
| Como funciona | `frontend/comofunciona.html` |

### Telas Administrativas

| Tela | Arquivo |
| --- | --- |
| Login admin | `frontend/adm-login.html` |
| Dashboard admin | `frontend/adm.html` |
| Livros e estoque | `frontend/adm-livros.html` |
| Gerenciar livro | `frontend/adm-gerenciar-livro.html` |
| Reservas | `frontend/adm-reservas.html` |
| Confirmar emprestimo | `frontend/adm-emprestimo.html` |
| Devolucao | `frontend/adm-devolucao.html` |
| Atrasos | `frontend/adm-atrasos.html` |
| Usuarios | `frontend/adm-usuarios.html` |

### CSS

| Arquivo | Responsabilidade |
| --- | --- |
| `frontend/css/global.css` | Base visual compartilhada |
| `frontend/css/catalogo.css` | Catalogo, detalhe de livro e area do cliente |
| `frontend/css/adm.css` | Painel administrativo |
| `frontend/css/index.css` | Pagina inicial |
| `frontend/css/comofunciona.css` | Como funciona |
| `frontend/css/quemsomos.css` | Quem somos |
| `frontend/css/suporte.css` | Suporte |
| `frontend/css/minha-conta.css` | Minha conta |
| `frontend/css/styles.css` | Estilos antigos/compartilhados |

## Banco De Dados

O banco principal e `techbook`.

Arquivo salvo no projeto:

```text
database/techbook.sql
```

Tabelas principais:

| Tabela | O que guarda |
| --- | --- |
| `livros` | Acervo, categoria, imagem, estoque total e estoque disponivel |
| `usuarios` | Clientes cadastrados, senha, bloqueio e contato |
| `reservas` | Reservas feitas pelos clientes |
| `emprestimos` | Emprestimos ativos, devolvidos, atrasados ou extraviados |
| `devolucoes` | Historico de devolucao e estado fisico do livro |

Quando importar dados de outra copia do projeto, compare por:

- livro: titulo + autor;
- usuario: email;
- reserva: usuario + livro + data + status;
- emprestimo: usuario + livro + data de emprestimo + status;
- devolucao: emprestimo correspondente.

## Fluxo Principal Do Cliente

1. Cliente entra no catalogo.
2. Escolhe um livro.
3. Faz login ou cadastro.
4. Reserva o livro.
5. A reserva aparece em `minhas-reservas.html`.
6. O administrador confirma a retirada.
7. A reserva vira emprestimo.
8. O cliente acompanha em `meus-emprestimos.html`.
9. A devolucao aparece no historico.

## Fluxo Principal Do Administrador

1. Admin entra por `adm-login.html`.
2. Dashboard mostra indicadores gerais.
3. Admin ve reservas pendentes.
4. Admin confirma retirada e gera emprestimo.
5. Admin acompanha emprestimos ativos e atrasados.
6. Admin pode registrar contato em atraso.
7. Admin pode marcar extravio.
8. Admin registra devolucao.
9. Estoque e bloqueio do cliente sao atualizados conforme a regra.

## Regras De Negocio

| Regra | Onde fica |
| --- | --- |
| Reserva dura 1 dia | `TechbookService.java` |
| Emprestimo dura 14 dias | `TechbookService.java` |
| Renovacao adiciona 7 dias | `TechbookService.java` |
| Cliente pode ter ate 3 livros em uso | `TechbookService.java` |
| Reserva vencida expira automaticamente | `TechbookService.java` |
| Livro emprestado reduz disponibilidade | `TechbookService.java` |
| Devolucao restaura disponibilidade | `TechbookService.java` |
| Extravio reduz acervo fisico | `TechbookService.java` |
| Cliente atrasado/extraviado pode ser bloqueado | `TechbookService.java` |
| Mais reservados usa reservas + emprestimos | `TechbookService.java` e `catalogo.js` |
| Sugestoes semelhantes usam categoria e autor | `catalogo.js` |

## Rotas Principais Da API

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/api/livros` | Lista catalogo |
| `GET` | `/api/livros/mais-procurados` | Lista livros mais reservados/procurados |
| `GET` | `/api/livros/{id}` | Detalhe do livro |
| `POST` | `/api/livros` | Cadastra livro no admin |
| `PUT` | `/api/livros/{id}` | Atualiza livro |
| `DELETE` | `/api/livros/{id}` | Exclui livro quando permitido |
| `POST` | `/api/clientes` | Cadastra cliente |
| `POST` | `/api/clientes/login` | Login do cliente |
| `GET` | `/api/reservas` | Lista reservas no admin |
| `POST` | `/api/reservas` | Cria reserva |
| `PATCH` | `/api/reservas/{id}/cancelar` | Cancela reserva |
| `POST` | `/api/emprestimos/confirmar-retirada` | Transforma reserva em emprestimo |
| `GET` | `/api/emprestimos` | Lista emprestimos |
| `PATCH` | `/api/emprestimos/{id}/renovar` | Renova emprestimo |
| `PATCH` | `/api/emprestimos/{id}/contato` | Registra contato de pendencia |
| `PATCH` | `/api/emprestimos/{id}/extraviar` | Marca extravio |
| `POST` | `/api/emprestimos/devolucoes` | Registra devolucao |
| `GET` | `/api/emprestimos/devolucoes` | Lista devolucoes |
| `POST` | `/api/administracao/login` | Login admin |
| `GET` | `/api/administracao/dashboard` | Indicadores do dashboard |

## Login Administrativo

```text
E-mail: admin@techbook.local
Senha: 123456
```

Nesta versao, o administrador e uma credencial fixa no backend.
Uma tabela de administradores pode ser uma melhoria futura.

## Checklist Para A Equipe

Antes de apresentar ou entregar:

- ligar MySQL no XAMPP;
- importar `database/techbook.sql` no banco `techbook`;
- iniciar backend com `backend/run-backend.ps1`;
- abrir `frontend/catalogo.html`;
- testar cadastro/login de cliente;
- testar reserva;
- entrar no admin;
- confirmar retirada;
- registrar devolucao;
- conferir se estoque mudou;
- conferir dashboard;
- conferir se o catalogo lista a quantidade esperada de livros.

## Cuidados Ao Alterar

- Nao apagar livro com reserva ou emprestimo ativo.
- Nao editar estoque direto no banco sem conferir emprestimos ativos.
- Nao trocar o nome das chaves usadas em `app.js` sem ajustar todas as telas.
- Quando mudar CSS ou JS no catalogo, atualizar a versao no `catalogo.html` para evitar cache.
- Quando mexer no banco local, salvar um novo dump em `database/techbook.sql`.
- Quando importar de uma copia, preferir mesclar dados em vez de substituir o banco inteiro.
