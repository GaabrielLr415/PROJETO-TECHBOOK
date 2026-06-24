CREATE TABLE IF NOT EXISTS `recuperacao_senha` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `codigo` varchar(6) NOT NULL,
  `expiracao` datetime(6) NOT NULL,
  `utilizado` bit(1) NOT NULL DEFAULT b'0',
  `tentativas` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_recuperacao_senha_usuario` (`usuario_id`),
  KEY `idx_recuperacao_senha_expiracao` (`expiracao`),
  CONSTRAINT `fk_recuperacao_senha_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
