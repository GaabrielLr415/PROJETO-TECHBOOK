package com.techbook.controller;

import com.techbook.dto.BookRequest;
import com.techbook.dto.LivroResponse;
import com.techbook.service.TechbookService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final TechbookService service;

    public LivroController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<LivroResponse> listarTodos() {
        return service.listarLivros();
    }

    @GetMapping("/{id}")
    public LivroResponse buscarPorId(@PathVariable Long id) {
        return service.buscarLivro(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LivroResponse cadastrar(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @RequestBody BookRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.criarLivro(request);
    }

    @PutMapping("/{id}")
    public LivroResponse atualizar(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @PathVariable Long id,
        @RequestBody BookRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.atualizarLivro(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @PathVariable Long id
    ) {
        service.validarTokenAdministrador(token);
        service.excluirLivro(id);
    }
}
