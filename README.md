# TechBook

Sistema de biblioteca para consulta, reserva, emprestimo, renovacao e devolucao de livros.

## Como rodar

O passo a passo completo esta no arquivo:

```text
GUIA-INSTALACAO-E-CONEXAO.md
```

Resumo rapido:

1. Ligue o MySQL no XAMPP.
2. Crie/importe o banco `techbook` usando apenas `database/techbook.sql`.
3. Abra a pasta `backend` no PowerShell.
4. Rode:

```powershell
.\run-backend.ps1
```

5. Abra `frontend/catalogo.html`.

## Login do administrador

```text
E-mail: admin@techbook.local
Senha: 123456
```

Nesta versao do projeto, o administrador e uma credencial fixa validada pelo backend.
Nao existe tabela separada de administradores no banco.

## Antes de enviar pelo Drive

Nao envie:

- `.git/`
- `.vscode/`
- `backend/target/`
- arquivos `.log`
