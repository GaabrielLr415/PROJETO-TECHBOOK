package com.techbook.controller;

import com.techbook.dto.AlterarSenhaRequest;
import com.techbook.dto.ClienteBloqueioRequest;
import com.techbook.dto.ClienteRequest;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.LoginRequest;
import com.techbook.dto.RecuperarSenhaCodigoRequest;
import com.techbook.dto.RecuperarSenhaCodigoResponse;
import com.techbook.dto.RecuperarSenhaRequest;
import com.techbook.dto.ReservaResponse;
import com.techbook.dto.UsuarioResponse;
import com.techbook.dto.VerificarCodigoRecuperacaoRequest;
import com.techbook.service.TechbookService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
public class UsuarioController {

    private final TechbookService service;

    public UsuarioController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponse> listarTodos(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        service.validarTokenAdministrador(token);
        return service.listarClientes();
    }

    @GetMapping("/{clienteId}")
    public UsuarioResponse buscarPorId(@PathVariable Long clienteId) {
        return service.buscarCliente(clienteId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody ClienteRequest request) {
        return service.criarCliente(request);
    }

    @PostMapping("/login")
    public UsuarioResponse login(@RequestBody LoginRequest request) {
        return service.loginCliente(request);
    }

    @PostMapping("/recuperar-senha/codigo")
    public RecuperarSenhaCodigoResponse solicitarCodigoRecuperacao(@RequestBody RecuperarSenhaCodigoRequest request) {
        return service.solicitarCodigoRecuperacao(request);
    }

    @PostMapping("/recuperar-senha/verificar")
    public RecuperarSenhaCodigoResponse verificarCodigoRecuperacao(@RequestBody VerificarCodigoRecuperacaoRequest request) {
        return service.verificarCodigoRecuperacao(request);
    }

    @PutMapping("/recuperar-senha")
    public UsuarioResponse recuperarSenha(@RequestBody RecuperarSenhaRequest request) {
        return service.recuperarSenha(request);
    }

    @PutMapping("/{clienteId}")
    public UsuarioResponse atualizar(@PathVariable Long clienteId, @RequestBody ClienteRequest request) {
        return service.atualizarCliente(clienteId, request);
    }

    @PutMapping("/{clienteId}/senha")
    public UsuarioResponse alterarSenha(@PathVariable Long clienteId, @RequestBody AlterarSenhaRequest request) {
        return service.alterarSenha(clienteId, request);
    }

    @PatchMapping("/{clienteId}/bloqueio")
    public UsuarioResponse alterarBloqueio(
        @PathVariable Long clienteId,
        @RequestBody ClienteBloqueioRequest request,
        @RequestHeader(value = "X-Admin-Token", required = false) String token
    ) {
        service.validarTokenAdministrador(token);
        return service.alterarBloqueioCliente(clienteId, request);
    }

    @GetMapping("/{clienteId}/reservas")
    public List<ReservaResponse> listarReservas(@PathVariable Long clienteId) {
        return service.listarReservasDoCliente(clienteId);
    }

    @GetMapping("/{clienteId}/emprestimos")
    public List<EmprestimoResponse> listarEmprestimos(@PathVariable Long clienteId) {
        return service.listarEmprestimosDoCliente(clienteId);
    }
}
