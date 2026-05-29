package com.techbook.dto;

public record ContatoPendenciaRequest(
    Long administradorId,
    String canal,
    String observacao
) {
}
