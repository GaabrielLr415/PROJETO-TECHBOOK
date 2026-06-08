package com.techbook.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String remetente;

    public EmailService(
        ObjectProvider<JavaMailSender> mailSenderProvider,
        @Value("${techbook.mail.from:}") String remetente
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.remetente = remetente;
    }

    public void enviarCodigoRecuperacao(String destinatario, String codigo, int minutosValidade) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new IllegalStateException("Envio de e-mail nao configurado. Configure o SMTP para enviar o codigo de recuperacao.");
        }

        SimpleMailMessage mensagem = new SimpleMailMessage();
        if (remetente != null && !remetente.isBlank()) {
            mensagem.setFrom(remetente);
        }
        mensagem.setTo(destinatario);
        mensagem.setSubject("Recuperacao de Senha - TECHBOOK");
        mensagem.setText("""
            Ola!

            Recebemos uma solicitacao de recuperacao de senha.

            Seu codigo de recuperacao e: %s

            O codigo expira em %d minutos.

            Caso nao tenha solicitado esta recuperacao, ignore este e-mail.

            Equipe TECHBOOK
            """.formatted(codigo, minutosValidade));

        try {
            mailSender.send(mensagem);
        } catch (MailException exception) {
            throw new IllegalStateException("Nao foi possivel enviar o e-mail de recuperacao. Confira a configuracao SMTP.");
        }
    }
}
