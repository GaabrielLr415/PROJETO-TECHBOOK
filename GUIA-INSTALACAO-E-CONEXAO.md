# Guia de instalação e conexão do TechBook

Este guia explica como baixar o projeto, preparar o banco de dados e abrir o sistema em outro computador.

## 1. O que instalar

Instale estes programas:

1. Visual Studio Code
2. Extension Pack for Java no VS Code
3. Spring Boot Extension Pack no VS Code
4. JDK 17 ou superior
5. XAMPP

## 2. Estrutura do projeto

O projeto tem três partes principais:

- `frontend/`: telas HTML, CSS e JavaScript
- `backend/`: API em Java com Spring Boot
- `database/`: arquivo SQL do banco de dados

## 3. Como enviar pelo Google Drive

Antes de subir no Drive, faça uma cópia da pasta do projeto e remova itens que não precisam ir junto.

Não envie:

- `.git/`
- `.vscode/`
- `backend/target/`
- arquivos `.log`, se existirem

Depois disso, compacte a pasta em `.zip` e envie o arquivo para o Google Drive.

## 4. Como preparar em outro computador

### Opção automática

1. Baixe o `.zip` pelo Google Drive.
2. Extraia a pasta em um local simples, por exemplo:

```text
C:\TechBook
```

3. Abra o XAMPP.
4. Clique em `Start` no MySQL.
5. Dê dois cliques em:

```text
PREPARAR-E-ABRIR-TECHBOOK.bat
```

Esse arquivo importa `database/techbook.sql`, inicia o backend e abre o catálogo.

Se der erro, use a opção manual abaixo.

### Opção manual

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

Esse é o banco oficial e mais atualizado para esta versão do projeto.

Importante: para uma instalação nova, use apenas `database/techbook.sql`. A pasta antiga `database/SQL/` foi removida para não gerar dúvida.

O arquivo `database/migrar-senhas-para-hash.sql` só deve ser usado se você já tinha um banco antigo com senhas em texto. Em instalação nova, não precisa usar esse arquivo.

## 5. Configuração do backend

O backend já está configurado para usar:

- endereço do banco: `localhost`
- porta: `3306`
- banco: `techbook`
- usuário: `root`
- senha: vazia

As configurações ficam em:

```text
backend/src/main/resources/application.properties
```

## 6. Como iniciar o backend

Abra o PowerShell na pasta `backend` e rode:

```powershell
.\run-backend.ps1
```

Quando funcionar, aparecerá uma mensagem parecida com:

```text
Tomcat started on port 8080
Started TechbookApplication
```

A API ficará disponível em:

```text
http://localhost:8080/api
```

## 7. Como verificar se a API está funcionando

Com o backend ligado, abra no navegador:

```text
http://localhost:8080/api/livros
```

Se aparecer uma lista de livros em formato JSON, o backend está funcionando.

## 8. Como abrir o frontend

Com o backend ligado, abra os arquivos da pasta `frontend`.

Tela principal do catálogo:

```text
frontend/catalogo.html
```

Tela de login administrativo:

```text
frontend/adm-login.html
```

## 9. Login do administrador

Use estes dados para entrar na área administrativa:

```text
E-mail: admin@techbook.local
Senha: 123456
```

Depois do login, o sistema abre o painel administrativo.

Observação: nesta versão, o administrador é uma credencial fixa validada pelo backend. Por isso o banco possui clientes/usuários, mas não possui uma tabela separada de administradores.

## 10. Fluxo principal para testar

1. Abra `frontend/cadastro.html` e crie um cliente.
2. Abra `frontend/catalogo.html`.
3. Reserve até 3 livros.
4. Tente reservar um quarto livro para confirmar o bloqueio.
5. Entre no admin por `frontend/adm-login.html`.
6. Vá em `Confirmar retirada`.
7. Confirme a retirada de uma reserva.
8. Confira se o empréstimo aparece em `Empréstimos ativos`.
9. Teste a renovação do empréstimo.
10. Vá em `Registrar devolução` e registre a devolução.
11. Confira se o livro voltou a ficar disponível no catálogo.
12. Para testar pendências, deixe um empréstimo passar do prazo e abra `Empréstimos atrasados`.
13. Registre uma tentativa de contato e, se necessário, marque o exemplar como extraviado.

## 11. Regras importantes do sistema

- Cada cliente pode ter no máximo 3 livros entre reservas pendentes e empréstimos ativos.
- A reserva fica disponível para retirada por 1 dia.
- Reservas vencidas são marcadas como `EXPIRADA`.
- O empréstimo dura 14 dias.
- A renovação aumenta o prazo em 7 dias.
- Cada empréstimo pode ser renovado apenas uma vez.
- A devolução é registrada pelo administrador.
- Ao devolver, o sistema registra o estado do livro e uma observação opcional.
- Cliente com empréstimo atrasado ou extraviado fica bloqueado para novas reservas e retiradas.
- O administrador pode registrar tentativas de contato em `Empréstimos atrasados`.
- Ao marcar um empréstimo como `EXTRAVIADO`, o sistema reduz o total do acervo em 1.
- Se o exemplar for recuperado depois, registrar a devolução restaura o acervo e libera o cliente quando não houver outra pendência.

## 12. Estoque zero e exemplar perdido

Se todos os exemplares de um título foram perdidos ou estão indisponíveis, use:

- `Disponível`: `0`
- `Total no acervo`: `0`, quando nenhum exemplar físico restou na instituição

Se os exemplares ainda existem, mas estão emprestados, mantenha o `Total no acervo` com a quantidade real e deixe apenas `Disponível` como `0`.

## 13. Problemas comuns

### O frontend mostra erro de conexão

Mensagem parecida:

```text
Não foi possível conectar ao backend em http://localhost:8080/api
```

Isso significa que o backend não está ligado. Abra a pasta `backend` e rode:

```powershell
.\run-backend.ps1
```

### O backend não inicia

Confira:

- se o MySQL está ligado no XAMPP;
- se o banco `techbook` existe;
- se o arquivo `database/techbook.sql` foi importado;
- se existe JDK 17 ou superior instalado.

### Erro ao rodar clean

Se o comando `clean` não conseguir apagar a pasta `backend/target`, feche o VS Code, terminais e janelas que possam estar usando o projeto.

Essa pasta não precisa ser enviada no Drive.

### Acentos quebrados no banco

Use o arquivo:

```text
database/corrigir-acentuacao.sql
```

E mantenha a conexão do banco com UTF-8.

## 14. Ordem recomendada para rodar

1. Abrir o XAMPP
2. Ligar o MySQL
3. Importar `database/techbook.sql`, se ainda não importou
4. Abrir o PowerShell na pasta `backend`
5. Rodar `.\run-backend.ps1`
6. Abrir `frontend/catalogo.html`
7. Testar cadastro, login, reserva, admin, empréstimo e devolução
