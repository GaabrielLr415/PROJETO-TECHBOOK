package com.techbook.dto;

import java.time.LocalDate;

public record DevolucaoResponse(
    Long id,
    Long emprestimoId,
    Long administradorId,
    LocalDate dataDevolucao,
    String estadoLivro,
    String statusDevolucao,
    String observacao,
    UsuarioResponse cliente,
    LivroResponse livro
) {
}
