package com.techbook.controller;

import com.techbook.dto.AdminLoginResponse;
import com.techbook.dto.DashboardResponse;
import com.techbook.dto.LoginRequest;
import com.techbook.service.TechbookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/administracao")
public class AdministracaoController {

    /*
     * Rotas do painel administrativo.
     * O login consulta a tabela de administradores e devolve um token local para
     * liberar o dashboard e as telas protegidas.
     */

    private final TechbookService service;

    public AdministracaoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        service.validarTokenAdministrador(token);
        return service.buscarDashboard();
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@RequestBody LoginRequest request) {
        return service.loginAdministrador(request);
    }
}
