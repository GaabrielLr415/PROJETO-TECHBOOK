-- Migra bancos antigos que ainda possuem a coluna `senha` em texto puro.
-- Para o projeto de apresentacao, todos os usuarios existentes passam a usar a senha padrao: 123456.
-- Novos cadastros e novas alteracoes de senha ja serao salvos com BCrypt pelo backend.

ALTER TABLE usuarios
  ADD COLUMN senha_hash varchar(255) DEFAULT NULL;

UPDATE usuarios
SET senha_hash = '$2a$10$97UerRhTrUprEhgqk.xIJu3UnJuHt.ivYEEZZIFEMdENw.cXCk7om'
WHERE senha_hash IS NULL OR senha_hash = '';

ALTER TABLE usuarios
  DROP COLUMN senha;
