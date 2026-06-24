# MER e DER - TECHBOOK

Este documento resume a modelagem atual do banco do sistema TECHBOOK.

## MER

Entidades principais:

- Usuario: representa o cliente cadastrado na plataforma.
- Administrador: representa a conta administrativa que acessa o painel interno.
- Livro: representa os livros disponíveis no acervo.
- Reserva: representa a reserva feita pelo cliente para retirada presencial.
- Emprestimo: representa a retirada confirmada pelo administrador.
- Devolucao: representa a devolução registrada para um empréstimo.
- RecuperacaoSenha: representa os códigos temporários usados na redefinição de senha.

## Observação Sobre Administradores

A versão atual possui tabela própria de administradores. O login administrativo valida e-mail e senha com BCrypt, gera um `token_sessao` e exige esse token nas rotas administrativas.

O campo `administrador_id` em empréstimos e devoluções registra qual administrador realizou a operação.

## Regras De Relacionamento

- Um usuário pode ter várias reservas.
- Um usuário pode ter vários empréstimos, respeitando o limite de 3 livros em uso.
- Um usuário pode ter várias devoluções registradas.
- Um usuário pode ter vários códigos de recuperação de senha ao longo do tempo.
- Um livro pode aparecer em várias reservas ao longo do tempo.
- Um livro pode aparecer em vários empréstimos ao longo do tempo.
- Uma reserva pertence a um usuário e a um livro.
- Um empréstimo pertence a um usuário e a um livro.
- Um empréstimo pode estar ligado a uma reserva.
- Um empréstimo pode ter uma devolução registrada.
- Uma devolução pertence a um empréstimo, a um usuário e a um livro.

## DER Em Mermaid

```mermaid
erDiagram
    USUARIOS ||--o{ RESERVAS : realiza
    USUARIOS ||--o{ EMPRESTIMOS : possui
    USUARIOS ||--o{ DEVOLUCOES : devolve
    USUARIOS ||--o{ RECUPERACAO_SENHA : solicita
    LIVROS ||--o{ RESERVAS : reservado_em
    LIVROS ||--o{ EMPRESTIMOS : emprestado_em
    LIVROS ||--o{ DEVOLUCOES : retornado_em
    RESERVAS ||--o| EMPRESTIMOS : gera
    EMPRESTIMOS ||--o| DEVOLUCOES : registra

    USUARIOS {
        bigint id PK
        varchar nome
        varchar email
        varchar telefone
        varchar cpf
        varchar senha_hash
        varchar token_sessao
        bit bloqueado
        varchar motivo_bloqueio
    }

    ADMINISTRADORES {
        bigint id PK
        varchar nome
        varchar email
        varchar senha_hash
        bit ativo
        varchar token_sessao
    }

    LIVROS {
        bigint id PK
        varchar titulo
        varchar autor
        varchar categoria
        varchar descricao
        varchar imagem_url
        varchar isbn
        int quantidade_disponivel
        int quantidade_total
    }

    RESERVAS {
        bigint id PK
        date data_reserva
        date prazo_retirada
        varchar status
        bigint cliente_id FK
        bigint livro_id FK
    }

    EMPRESTIMOS {
        bigint id PK
        bigint administrador_id
        date data_emprestimo
        date data_devolucao_prevista
        varchar status
        bit renovado
        varchar estado_livro
        varchar observacao_devolucao
        varchar historico_contato
        bigint cliente_id FK
        bigint livro_id FK
        bigint reserva_id FK
    }

    DEVOLUCOES {
        bigint id PK
        bigint administrador_id
        date data_devolucao
        varchar estado_livro
        varchar observacao
        varchar status_devolucao
        bigint emprestimo_id FK
        bigint cliente_id FK
        bigint livro_id FK
    }

    RECUPERACAO_SENHA {
        bigint id PK
        varchar codigo
        datetime expiracao
        int tentativas
        bit utilizado
        bigint usuario_id FK
    }
```
