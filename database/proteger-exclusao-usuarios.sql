USE `techbook`;

DROP TRIGGER IF EXISTS `trg_usuarios_bloqueia_delete_com_vinculo`;

DELIMITER ;;
CREATE TRIGGER `trg_usuarios_bloqueia_delete_com_vinculo`
BEFORE DELETE ON `usuarios`
FOR EACH ROW
BEGIN
  IF (
    (SELECT COUNT(*) FROM `reservas` WHERE `cliente_id` = OLD.`id`) > 0
    OR (SELECT COUNT(*) FROM `emprestimos` WHERE `cliente_id` = OLD.`id`) > 0
    OR (SELECT COUNT(*) FROM `devolucoes` WHERE `cliente_id` = OLD.`id`) > 0
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Nao exclua este usuario pelo banco: ele possui reservas, emprestimos ou devolucoes vinculadas. Use bloquear/desativar no painel ADM. Exclusao manual somente para usuario sem pendencias ou historico.';
  END IF;
END ;;
DELIMITER ;
