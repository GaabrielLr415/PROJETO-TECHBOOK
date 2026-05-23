package com.techbook.dto;

public record AlterarSenhaRequest(
    String senhaAtual,
    String novaSenha,
    String confirmarNovaSenha
) {
}
