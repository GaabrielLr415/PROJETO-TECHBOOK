package com.techbook.dto;

public record RecuperarSenhaRequest(String email, String codigo, String novaSenha, String confirmarNovaSenha) {}
