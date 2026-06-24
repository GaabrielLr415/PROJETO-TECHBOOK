-- Migra bancos antigos que ainda possuem a coluna `senha` em texto puro.
-- Para o projeto de apresentacao, usuarios antigos sem hash passam a usar a senha padrao: 123456.
-- Novos cadastros e novas alteracoes de senha ja serao salvos com BCrypt pelo backend.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS senha_hash varchar(255) DEFAULT NULL;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS token_sessao varchar(100) DEFAULT NULL;

UPDATE usuarios
SET senha_hash = '$2a$10$SqFMw4xxultHYOFwrbrHeeNFY4iUyvN2sSdMe19gGn4J7DPYT1iQG'
WHERE senha_hash IS NULL
  OR senha_hash = ''
  OR (
    senha_hash NOT LIKE '$2a$%'
    AND senha_hash NOT LIKE '$2b$%'
    AND senha_hash NOT LIKE '$2y$%'
  );

ALTER TABLE usuarios
  DROP COLUMN IF EXISTS senha;
