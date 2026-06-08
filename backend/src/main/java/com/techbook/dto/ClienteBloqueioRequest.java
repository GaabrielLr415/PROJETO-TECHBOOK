package com.techbook.dto;

public record ClienteBloqueioRequest(
    boolean bloqueado,
    String motivo
) {
}
