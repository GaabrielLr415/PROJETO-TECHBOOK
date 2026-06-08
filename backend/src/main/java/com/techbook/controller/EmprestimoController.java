package com.techbook.controller;

import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.ContatoPendenciaRequest;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.DevolucaoResponse;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.ExtravioRequest;
import com.techbook.service.TechbookService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    /*
     * Rotas de emprestimo e devolucao.
     * Aqui entram os fluxos administrativos depois da reserva: confirmar
     * retirada, renovar, registrar contato de atraso, marcar extravio e devolver.
     */

    private final TechbookService service;

    public EmprestimoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmprestimoResponse> listar(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        service.validarTokenAdministrador(token);
        return service.listarEmprestimos();
    }

    @PostMapping("/confirmar-retirada")
    @ResponseStatus(HttpStatus.CREATED)
    public EmprestimoResponse confirmarRetirada(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @RequestBody ConfirmarRetiradaRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.confirmarRetirada(request);
    }

    @PatchMapping("/{id}/renovar")
    public EmprestimoResponse renovar(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @PathVariable Long id
    ) {
        service.validarTokenAdministrador(token);
        return service.renovarEmprestimo(id);
    }

    @PatchMapping("/{id}/contato")
    public EmprestimoResponse registrarContato(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @PathVariable Long id,
        @RequestBody ContatoPendenciaRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.registrarContatoPendencia(id, request);
    }

    @PatchMapping("/{id}/extraviar")
    public EmprestimoResponse marcarExtraviado(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @PathVariable Long id,
        @RequestBody ExtravioRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.marcarEmprestimoComoExtraviado(id, request);
    }

    @PostMapping("/devolucoes")
    @ResponseStatus(HttpStatus.CREATED)
    public DevolucaoResponse devolver(
        @RequestHeader(value = "X-Admin-Token", required = false) String token,
        @RequestBody DevolucaoRequest request
    ) {
        service.validarTokenAdministrador(token);
        return service.registrarDevolucao(request);
    }

    @GetMapping("/devolucoes")
    public List<DevolucaoResponse> listarDevolucoes(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        service.validarTokenAdministrador(token);
        return service.listarDevolucoes();
    }
}
