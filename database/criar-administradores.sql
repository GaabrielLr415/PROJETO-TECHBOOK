CREATE TABLE IF NOT EXISTS `administradores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `ativo` bit(1) NOT NULL DEFAULT b'1',
  `token_sessao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_administradores_email` (`email`),
  KEY `idx_administradores_token` (`token_sessao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `administradores` (`nome`, `email`, `senha_hash`, `ativo`, `token_sessao`)
VALUES ('Administrador', 'admin@techbook.local', '$2a$10$SqFMw4xxultHYOFwrbrHeeNFY4iUyvN2sSdMe19gGn4J7DPYT1iQG', b'1', NULL)
ON DUPLICATE KEY UPDATE
  `nome` = VALUES(`nome`),
  `senha_hash` = VALUES(`senha_hash`),
  `ativo` = b'1',
  `token_sessao` = NULL;
