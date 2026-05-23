package com.techbook.dto;

public record AdminLoginResponse(
    String nome,
    String email,
    String token
) {
}
