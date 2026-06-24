package com.techbook;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.techbook.dto.BookRequest;
import com.techbook.dto.ClienteRequest;
import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.LivroResponse;
import com.techbook.dto.LoginRequest;
import com.techbook.dto.ReservaRequest;
import com.techbook.dto.UsuarioResponse;
import com.techbook.model.Emprestimo;
import com.techbook.model.Livro;
import com.techbook.model.Reserva;
import com.techbook.model.Usuario;
import com.techbook.repository.EmprestimoRepository;
import com.techbook.repository.LivroRepository;
import com.techbook.repository.ReservaRepository;
import com.techbook.repository.UsuarioRepository;
import com.techbook.service.TechbookService;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TechbookApplicationTests {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    private TechbookService service;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Test
    void pesquisaLivroListaLivroCadastrado() {
        LivroResponse livro = criarLivro("Pesquisa Unica", 2);

        boolean encontrado = service.listarLivros().stream()
            .anyMatch(item -> item.id().equals(livro.id()) && item.titulo().contains("Pesquisa Unica"));

        assertTrue(encontrado);
    }

    @Test
    void reservaLivroDisponivelComPrazoDeUmDia() {
        UsuarioResponse cliente = criarCliente();
        LivroResponse livro = criarLivro("Reserva Disponivel", 2);

        var reserva = service.criarReserva(new ReservaRequest(cliente.id(), livro.id()));

        assertEquals("PENDENTE", reserva.status());
        assertEquals(LocalDate.now().plusDays(1), reserva.prazoRetirada());
    }

    @Test
    void cancelaAutomaticamenteReservaVencida() {
        Usuario cliente = buscarUsuario(criarCliente().id());
        Livro livro = buscarLivro(criarLivro("Reserva Vencida", 1).id());
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.setDataReserva(LocalDate.now().minusDays(2));
        reserva.setPrazoRetirada(LocalDate.now().minusDays(1));
        reserva.setStatus("PENDENTE");
        reserva = reservaRepository.save(reserva);

        service.expirarReservasVencidas();

        assertEquals("CANCELADA", reservaRepository.findById(reserva.getId()).orElseThrow().getStatus());
    }

    @Test
    void registraEmprestimoComPrazoDeQuatorzeDias() {
        var reserva = criarReservaPendente("Emprestimo Registrado", 2);

        var emprestimo = service.confirmarRetirada(new ConfirmarRetiradaRequest(reserva.id(), 1L));

        assertEquals("ATIVO", emprestimo.status());
        assertEquals(LocalDate.now().plusDays(14), emprestimo.dataDevolucaoPrevista());
    }

    @Test
    void bloqueiaClienteComTresEmprestimosAtivos() {
        Usuario cliente = buscarUsuario(criarCliente().id());
        for (int i = 0; i < 3; i++) {
            Livro livro = buscarLivro(criarLivro("Limite " + i, 1).id());
            Emprestimo emprestimo = new Emprestimo();
            emprestimo.setCliente(cliente);
            emprestimo.setLivro(livro);
            emprestimo.setAdministradorId(1L);
            emprestimo.setDataEmprestimo(LocalDate.now());
            emprestimo.setDataDevolucaoPrevista(LocalDate.now().plusDays(14));
            emprestimo.setStatus("ATIVO");
            emprestimo.setEstadoLivro("EMPRESTADO");
            emprestimoRepository.save(emprestimo);
        }
        LivroResponse novoLivro = criarLivro("Quarto Livro", 1);

        IllegalStateException error = assertThrows(
            IllegalStateException.class,
            () -> service.criarReserva(new ReservaRequest(cliente.getId(), novoLivro.id()))
        );

        assertEquals("Limite de emprestimos atingido. Realize a devolucao para novos emprestimos.", error.getMessage());
    }

    @Test
    void registraDevolucaoEAtualizaLivroComoDisponivel() {
        var reserva = criarReservaPendente("Livro Devolucao", 1);
        var emprestimo = service.confirmarRetirada(new ConfirmarRetiradaRequest(reserva.id(), 1L));
        Livro livroAntes = buscarLivro(emprestimo.livro().id());
        assertEquals(0, livroAntes.getQuantidadeDisponivel());

        var devolucao = service.registrarDevolucao(new DevolucaoRequest(emprestimo.id(), 1L, "BOM", "Sem danos"));

        assertNotNull(devolucao.id());
        assertEquals("REGISTRADA", devolucao.statusDevolucao());
        assertEquals(1, buscarLivro(emprestimo.livro().id()).getQuantidadeDisponivel());
    }

    @Test
    void renovaEmprestimoUmaUnicaVez() {
        var reserva = criarReservaPendente("Livro Renovacao", 1);
        var emprestimo = service.confirmarRetirada(new ConfirmarRetiradaRequest(reserva.id(), 1L));

        var renovado = service.renovarEmprestimo(emprestimo.id());

        assertTrue(renovado.renovado());
        assertEquals(LocalDate.now().plusDays(21), renovado.dataDevolucaoPrevista());
        assertThrows(IllegalStateException.class, () -> service.renovarEmprestimo(emprestimo.id()));
    }

    @Test
    void identificaEmprestimoEmAtraso() {
        Usuario cliente = buscarUsuario(criarCliente().id());
        Livro livro = buscarLivro(criarLivro("Livro Atrasado", 1).id());
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setAdministradorId(1L);
        emprestimo.setDataEmprestimo(LocalDate.now().minusDays(20));
        emprestimo.setDataDevolucaoPrevista(LocalDate.now().minusDays(1));
        emprestimo.setStatus("ATIVO");
        emprestimo.setEstadoLivro("EMPRESTADO");
        Long emprestimoId = emprestimoRepository.save(emprestimo).getId();

        var atrasado = service.listarEmprestimos().stream()
            .filter(item -> item.id().equals(emprestimoId))
            .findFirst()
            .orElseThrow();

        assertEquals("ATRASADO", atrasado.status());
        assertFalse(atrasado.renovado());
    }

    @Test
    void loginClienteGeraTokenDeSessaoEValidaAcesso() {
        UsuarioResponse cliente = criarCliente();

        UsuarioResponse login = service.loginCliente(new LoginRequest(cliente.email(), "123456"));

        assertNotNull(login.token());
        service.validarTokenCliente(login.id(), login.token());
        assertThrows(IllegalArgumentException.class, () -> service.validarTokenCliente(login.id(), "token-invalido"));
        assertNull(service.buscarCliente(login.id()).token());
    }

    private UsuarioResponse criarCliente() {
        int id = SEQUENCE.incrementAndGet();
        return service.criarCliente(new ClienteRequest(
            "Cliente Teste " + id,
            "cliente.teste." + id + "@techbook.local",
            "1199999" + String.format("%04d", id),
            "900000" + String.format("%05d", id),
            "123456"
        ));
    }

    private LivroResponse criarLivro(String titulo, int quantidade) {
        int id = SEQUENCE.incrementAndGet();
        return service.criarLivro(new BookRequest(
            titulo + " " + id,
            "Autor Teste",
            "Teste",
            "Descricao do livro de teste.",
            "img/livros.png",
            "ISBN-TESTE-" + id,
            quantidade,
            quantidade
        ));
    }

    private com.techbook.dto.ReservaResponse criarReservaPendente(String tituloLivro, int quantidade) {
        UsuarioResponse cliente = criarCliente();
        LivroResponse livro = criarLivro(tituloLivro, quantidade);
        return service.criarReserva(new ReservaRequest(cliente.id(), livro.id()));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow();
    }

    private Livro buscarLivro(Long id) {
        return livroRepository.findById(id).orElseThrow();
    }
}
