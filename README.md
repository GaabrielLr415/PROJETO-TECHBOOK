# TechBook

Sistema de biblioteca para consulta, reserva, empréstimo, renovação, devolução e controle de pendências de livros.

Versão final atualizada em: 07/06/2026.

## Como Rodar

O passo a passo completo está no arquivo `GUIA-INSTALACAO-E-CONEXAO.md`.

Resumo rápido:

Opção mais simples:

```text
PREPARAR-E-ABRIR-TECHBOOK.bat
```

Esse arquivo tenta importar o banco `techbook` usando `database/techbook.sql`, iniciar o backend e abrir o frontend. Antes de usar, ligue o MySQL no XAMPP.

Opção manual:

1. Ligue o MySQL no XAMPP.
2. Crie/importe o banco `techbook` usando `database/techbook.sql`.
3. Abra a pasta `backend` no PowerShell.
4. Rode:

```powershell
.\run-backend.ps1
```

5. Abra a tela desejada dentro da pasta `frontend`.

Telas principais:

- Cliente/catalogo: `frontend/catalogo.html`
- Minha conta: `frontend/minha-conta.html`
- Minhas reservas: `frontend/minhas-reservas.html`
- Meus empréstimos: `frontend/meus-emprestimos.html`
- Login administrativo: `frontend/adm-login.html`

## Privacidade

- O site disponibiliza a política de privacidade em `frontend/docs/politica-privacidade.pdf`.
- A versão editável do texto fica em `frontend/docs/politica-privacidade.html`.
- O documento explica o uso de dados como nome, CPF, e-mail, telefone e histórico de movimentações.
- Para uso real, a política deve ser revisada juridicamente e acompanhada de controles de segurança, auditoria e backup.

## Login Do Administrador

```text
E-mail: admin@techbook.local
Senha: 123456
```

Nesta versão do projeto, o administrador é uma credencial fixa validada pelo backend.

## Fluxo Principal

1. Cliente cria conta e reserva até 3 livros.
2. Reserva fica pendente por 1 dia.
3. Admin confirma a retirada em `Confirmar retirada`.
4. A reserva vira empréstimo ativo por 14 dias.
5. Admin acompanha em `Empréstimos ativos`.
6. Admin registra devolução em `Registrar devolução`.
7. O histórico de devolução guarda data, estado físico e observação.

## Pendências E Extravio

- Empréstimos vencidos aparecem em `Empréstimos atrasados`.
- O administrador pode registrar tentativas de contato com o cliente.
- Se o exemplar for perdido, o administrador marca o empréstimo como `Extraviado`.
- Ao marcar extravio, o cliente fica bloqueado para novas reservas e retiradas.
- O total do acervo é reduzido em 1 para refletir a perda física do exemplar.
- Se o livro for recuperado depois, a devolução restaura o acervo e libera o cliente caso não exista outra pendência.

## Regras Atendidas

- Reserva por 1 dia.
- Expiração automática de reserva vencida.
- Empréstimo por 14 dias.
- Limite de 3 livros entre reservas pendentes e empréstimos ativos.
- Renovação única por 7 dias.
- Verificação de atrasos.
- Registro de devolução com estado físico do livro.
- Bloqueio de cliente com empréstimo atrasado ou extraviado.
- Histórico de contato para pendências.
- Controle de exemplar extraviado e estoque igual a zero.

## Atualizacoes Pos-Aprovacao

A documentacao aprovada foi mantida. As melhorias criadas depois da aprovacao estao registradas em:

```text
docs/ATUALIZACOES-POS-APROVACAO.md
```

Esse arquivo explica o que foi adicionado, por que foi feito e onde aparece no sistema.

## Melhorias Futuras

Para uma aplicação em larga escala, o projeto pode evoluir com:

- login com vários administradores e níveis de permissão;
- auditoria completa das ações administrativas;
- backup automático do banco de dados;
- filtros avançados por mês, ano, status, cliente, livro e tipo de movimentação;
- relatórios mensais e anuais de reservas, empréstimos, devoluções e atrasos;
- sugestão inteligente de livros semelhantes para o cliente.

## Antes De Enviar Pelo Drive

Não envie:

- `.git/`
- `.vscode/`
- `backend/target/`
- arquivos `.log`

## Checklist De Entrega

- Importar `database/techbook.sql` em um banco chamado `techbook`.
- Iniciar o backend com `backend/run-backend.ps1`.
- Abrir `frontend/catalogo.html` e testar reserva com um cliente.
- Entrar no painel administrativo por `frontend/adm-login.html`.
- Validar o fluxo: confirmar retirada, acompanhar empréstimo, registrar devolução e verificar atrasos.
- Conferir o MER/DER em `docs/MER-DER-TECHBOOK.md`.
- Conferir o guia completo em `GUIA-INSTALACAO-E-CONEXAO.md`.
