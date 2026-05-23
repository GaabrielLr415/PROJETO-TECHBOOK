# Guia de instalacao e conexao do TechBook

Este guia explica como baixar o projeto, preparar o banco de dados e abrir o sistema em outro computador.

## 1. O que instalar

Instale estes programas:

1. Visual Studio Code
2. Extension Pack for Java no VS Code
3. Spring Boot Extension Pack no VS Code
4. JDK 17 ou superior
5. XAMPP

## 2. Estrutura do projeto

O projeto tem tres partes principais:

- `frontend/`: telas HTML, CSS e JavaScript
- `backend/`: API em Java com Spring Boot
- `database/`: arquivo SQL do banco de dados

## 3. Como enviar pelo Google Drive

Antes de subir no Drive, faca uma copia da pasta do projeto e remova itens que nao precisam ir junto.

Nao envie:

- `.git/`
- `.vscode/`
- `backend/target/`
- arquivos `.log`, se existirem

Depois disso, compacte a pasta em `.zip` e envie o arquivo para o Google Drive.

## 4. Como preparar em outro computador

1. Baixe o `.zip` pelo Google Drive.
2. Extraia a pasta em um local simples, por exemplo:

```text
C:\TechBook
```

3. Abra o XAMPP.
4. Clique em `Start` no MySQL.
5. Abra o phpMyAdmin.
6. Crie um banco chamado:

```text
techbook
```

7. Importe o arquivo:

```text
database/techbook.sql
```

Esse e o banco oficial e mais atualizado para esta versao do projeto.

Importante: para uma instalacao nova, use apenas `database/techbook.sql`. A pasta antiga `database/SQL/` foi removida para nao gerar duvida.

O arquivo `database/migrar-senhas-para-hash.sql` so deve ser usado se voce ja tinha um banco antigo com senhas em texto. Em instalacao nova, nao precisa usar esse arquivo.

## 5. Configuracao do backend

O backend ja esta configurado para usar:

- endereco do banco: `localhost`
- porta: `3306`
- banco: `techbook`
- usuario: `root`
- senha: vazia

As configuracoes ficam em:

```text
backend/src/main/resources/application.properties
```

## 6. Como iniciar o backend

Abra o PowerShell na pasta `backend` e rode:

```powershell
.\run-backend.ps1
```

Quando funcionar, aparecera uma mensagem parecida com:

```text
Tomcat started on port 8080
Started TechbookApplication
```

A API ficara disponivel em:

```text
http://localhost:8080/api
```

## 7. Como verificar se a API esta funcionando

Com o backend ligado, abra no navegador:

```text
http://localhost:8080/api/livros
```

Se aparecer uma lista de livros em formato JSON, o backend esta funcionando.

## 8. Como abrir o frontend

Com o backend ligado, abra os arquivos da pasta `frontend`.

Tela principal do catalogo:

```text
frontend/catalogo.html
```

Tela de login administrativo:

```text
frontend/adm-login.html
```

## 9. Login do administrador

Use estes dados para entrar na area administrativa:

```text
E-mail: admin@techbook.local
Senha: 123456
```

Depois do login, o sistema abre o painel administrativo.

Observacao: nesta versao, o administrador e uma credencial fixa validada pelo backend. Por isso o banco possui clientes/usuarios, mas nao possui uma tabela separada de administradores.

## 10. Fluxo principal para testar

1. Abra `frontend/cadastro.html` e crie um cliente.
2. Abra `frontend/catalogo.html`.
3. Reserve ate 3 livros.
4. Tente reservar um quarto livro para confirmar o bloqueio.
5. Entre no admin por `frontend/adm-login.html`.
6. Va em `Retiradas por Reserva`.
7. Confirme a retirada de uma reserva.
8. Confira se o emprestimo aparece em `Emprestimos Ativos`.
9. Teste a renovacao do emprestimo.
10. Va em `Registrar Devolucao` e registre a devolucao.
11. Confira se o livro voltou a ficar disponivel no catalogo.

## 11. Regras importantes do sistema

- Cada cliente pode ter no maximo 3 livros entre reservas pendentes e emprestimos ativos.
- A reserva fica disponivel para retirada por 1 dia.
- Reservas vencidas sao marcadas como `EXPIRADA`.
- O emprestimo dura 14 dias.
- A renovacao aumenta o prazo em 7 dias.
- Cada emprestimo pode ser renovado apenas uma vez.
- A devolucao e registrada pelo administrador.
- Ao devolver, o sistema registra o estado do livro e uma observacao opcional.

## 12. Problemas comuns

### O frontend mostra erro de conexao

Mensagem parecida:

```text
Nao foi possivel conectar ao backend em http://localhost:8080/api
```

Isso significa que o backend nao esta ligado. Abra a pasta `backend` e rode:

```powershell
.\run-backend.ps1
```

### O backend nao inicia

Confira:

- se o MySQL esta ligado no XAMPP;
- se o banco `techbook` existe;
- se o arquivo `database/techbook.sql` foi importado;
- se existe JDK 17 ou superior instalado.

### Erro ao rodar clean

Se o comando `clean` nao conseguir apagar a pasta `backend/target`, feche o VS Code, terminais e janelas que possam estar usando o projeto.

Essa pasta nao precisa ser enviada no Drive.

### Acentos quebrados no banco

Use o arquivo:

```text
database/corrigir-acentuacao.sql
```

E mantenha a conexao do banco com UTF-8.

## 13. Ordem recomendada para rodar

1. Abrir o XAMPP
2. Ligar o MySQL
3. Importar `database/techbook.sql`, se ainda nao importou
4. Abrir o PowerShell na pasta `backend`
5. Rodar `.\run-backend.ps1`
6. Abrir `frontend/catalogo.html`
7. Testar cadastro, login, reserva, admin, emprestimo e devolucao
