package com.techbook.service;

import com.techbook.dto.AlterarSenhaRequest;
import com.techbook.dto.AdminLoginResponse;
import com.techbook.dto.BookRequest;
import com.techbook.dto.ClienteRequest;
import com.techbook.dto.ClienteBloqueioRequest;
import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.ContatoPendenciaRequest;
import com.techbook.dto.DashboardResponse;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.DevolucaoResponse;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.ExtravioRequest;
import com.techbook.dto.LivroResponse;
import com.techbook.dto.LoginRequest;
import com.techbook.dto.RecuperarSenhaCodigoRequest;
import com.techbook.dto.RecuperarSenhaCodigoResponse;
import com.techbook.dto.RecuperarSenhaRequest;
import com.techbook.dto.ReservaRequest;
import com.techbook.dto.ReservaResponse;
import com.techbook.dto.UsuarioResponse;
import com.techbook.dto.VerificarCodigoRecuperacaoRequest;
import com.techbook.model.Devolucao;
import com.techbook.model.Emprestimo;
import com.techbook.model.Livro;
import com.techbook.model.RecuperacaoSenha;
import com.techbook.model.Reserva;
import com.techbook.model.Usuario;
import com.techbook.model.Administrador;
import com.techbook.repository.AdministradorRepository;
import com.techbook.repository.DevolucaoRepository;
import com.techbook.repository.EmprestimoRepository;
import com.techbook.repository.LivroRepository;
import com.techbook.repository.RecuperacaoSenhaRepository;
import com.techbook.repository.ReservaRepository;
import com.techbook.repository.UsuarioRepository;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TechbookService {

    /*
     * Servico central do TechBook.
     *
     * A equipe deve comecar por este arquivo quando precisar entender ou alterar
     * regras de negocio. Os controllers apenas recebem as chamadas da API; aqui
     * ficam as decisoes sobre reserva, emprestimo, devolucao, estoque, bloqueio,
     * dashboard, login e listagens especiais do catalogo.
     */

    // Centraliza os prazos usados no fluxo de reserva/emprestimo para manter a regra consistente.
    private static final int PRAZO_RETIRADA_DIAS = 1;
    private static final int PRAZO_EMPRESTIMO_DIAS = 14;
    private static final int PRAZO_RENOVACAO_DIAS = 7;
    private static final int LIMITE_EMPRESTIMOS_ATIVOS_POR_CLIENTE = 3;
    private static final String IMAGEM_PADRAO = "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80";
    private static final int CODIGO_RECUPERACAO_MINUTOS = 10;
    private static final int LIMITE_TENTATIVAS_CODIGO = 5;
    private static final String MENSAGEM_CODIGO_RECUPERACAO = "Se existir uma conta associada a este e-mail, enviaremos as instrucoes de recuperacao.";
    private static final Logger LOGGER = LoggerFactory.getLogger(TechbookService.class);

    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final DevolucaoRepository devolucaoRepository;
    private final RecuperacaoSenhaRepository recuperacaoSenhaRepository;
    private final AdministradorRepository administradorRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public TechbookService(
        LivroRepository livroRepository,
        UsuarioRepository usuarioRepository,
        ReservaRepository reservaRepository,
        EmprestimoRepository emprestimoRepository,
        DevolucaoRepository devolucaoRepository,
        RecuperacaoSenhaRepository recuperacaoSenhaRepository,
        AdministradorRepository administradorRepository,
        EmailService emailService
    ) {
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.devolucaoRepository = devolucaoRepository;
        this.recuperacaoSenhaRepository = recuperacaoSenhaRepository;
        this.administradorRepository = administradorRepository;
        this.emailService = emailService;
    }

    public AdminLoginResponse loginAdministrador(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de login nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String senha = textoObrigatorio(request.senha(), "senha");

        Administrador administrador = administradorRepository.findByEmailIgnoreCase(email)
            .filter(item -> Boolean.TRUE.equals(item.getAtivo()))
            .orElseThrow(() -> new IllegalArgumentException("Login ou senha do administrador incorretos."));

        if (!passwordEncoder.matches(senha, administrador.getSenhaHash())) {
            throw new IllegalArgumentException("Login ou senha do administrador incorretos.");
        }

        administrador.setTokenSessao("techbook-admin-" + UUID.randomUUID());
        administradorRepository.save(administrador);
        return new AdminLoginResponse(administrador.getNome(), administrador.getEmail(), administrador.getTokenSessao());
    }

    public void validarTokenAdministrador(String token) {
        if (token == null || token.isBlank() || administradorRepository.findByTokenSessaoAndAtivoTrue(token).isEmpty()) {
            throw new IllegalArgumentException("Acesso administrativo nao autorizado.");
        }
    }

    public List<LivroResponse> listarLivros() {
        expirarReservasVencidas();
        return livroRepository.findAll().stream()
            .sorted(Comparator.comparing(Livro::getId))
            .map(this::toLivroResponse)
            .toList();
    }

    public LivroResponse buscarLivro(Long id) {
        expirarReservasVencidas();
        return toLivroResponse(buscarLivroEntidade(id));
    }

    public List<LivroResponse> listarLivrosMaisProcurados() {
        expirarReservasVencidas();

        Map<Long, Long> procurasPorLivro = new HashMap<>();
        reservaRepository.findAll().forEach(reserva ->
            procurasPorLivro.merge(reserva.getLivro().getId(), 1L, Long::sum)
        );
        emprestimoRepository.findAll().forEach(emprestimo ->
            procurasPorLivro.merge(emprestimo.getLivro().getId(), 1L, Long::sum)
        );

        return livroRepository.findAll().stream()
            .filter(livro -> procurasPorLivro.getOrDefault(livro.getId(), 0L) > 0)
            .sorted(Comparator
                .comparing((Livro livro) -> procurasPorLivro.getOrDefault(livro.getId(), 0L)).reversed()
                .thenComparing(Livro::getTitulo, String.CASE_INSENSITIVE_ORDER))
            .limit(6)
            .map(this::toLivroResponse)
            .toList();
    }

    public LivroResponse criarLivro(BookRequest request) {
        Livro livro = new Livro();
        aplicarLivro(livro, request);
        return toLivroResponse(livroRepository.save(livro));
    }

    public LivroResponse atualizarLivro(Long id, BookRequest request) {
        Livro livro = buscarLivroEntidade(id);
        aplicarLivro(livro, request);
        return toLivroResponse(livroRepository.save(livro));
    }

    public void excluirLivro(Long id) {
        Livro livro = buscarLivroEntidade(id);
        // Impede apagar livros ainda envolvidos em operacoes ativas para nao quebrar o historico.
        boolean possuiReserva = reservaRepository.findAll().stream()
            .anyMatch(reserva -> reserva.getLivro().getId().equals(id) && !"CANCELADA".equals(reserva.getStatus()));
        boolean possuiEmprestimo = emprestimoRepository.findAll().stream()
            .anyMatch(emprestimo -> emprestimo.getLivro().getId().equals(id) && !"DEVOLVIDO".equals(calcularStatusEmprestimo(emprestimo)));

        if (possuiReserva || possuiEmprestimo) {
            throw new IllegalStateException("Nao e possivel excluir um livro com reservas ou emprestimos associados.");
        }

        livroRepository.delete(livro);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarClientes() {
        return usuarioRepository.findAll().stream()
            .sorted(Comparator.comparing(Usuario::getId))
            .map(this::toUsuarioResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarCliente(Long clienteId) {
        return toUsuarioResponse(garantirCliente(clienteId));
    }

    public UsuarioResponse criarCliente(ClienteRequest request) {
        validarCliente(request, null);
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setTelefone(request.telefone().trim());
        usuario.setCpf(request.cpf().trim());
        usuario.setSenhaHash(gerarHashSenha(textoObrigatorio(request.senha(), "senha")));
        usuario.setBloqueado(false);
        usuario.setMotivoBloqueio("");
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizarCliente(Long clienteId, ClienteRequest request) {
        validarCliente(request, clienteId);
        Usuario usuario = garantirCliente(clienteId);
        usuario.setNome(textoObrigatorio(request.nome(), "nome"));
        usuario.setEmail(textoObrigatorio(request.email(), "email").toLowerCase());
        usuario.setTelefone(textoObrigatorio(request.telefone(), "telefone"));
        usuario.setCpf(textoObrigatorio(request.cpf(), "cpf"));
        if (request.senha() != null && !request.senha().trim().isBlank()) {
            usuario.setSenhaHash(gerarHashSenha(request.senha().trim()));
        }
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse alterarSenha(Long clienteId, AlterarSenhaRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de senha nao informados.");
        }

        Usuario usuario = garantirCliente(clienteId);
        String senhaAtual = textoObrigatorio(request.senhaAtual(), "senha atual");
        String novaSenha = textoObrigatorio(request.novaSenha(), "nova senha");
        String confirmarNovaSenha = textoObrigatorio(request.confirmarNovaSenha(), "confirmacao da nova senha");

        if (usuario.getSenhaHash() == null || usuario.getSenhaHash().isBlank()) {
            throw new IllegalStateException("Esta conta nao possui senha cadastrada.");
        }
        if (!senhaConfere(senhaAtual, usuario.getSenhaHash())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }
        if (!novaSenha.equals(confirmarNovaSenha)) {
            throw new IllegalArgumentException("A nova senha e a confirmacao precisam ser iguais.");
        }
        if (novaSenha.length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres.");
        }

        usuario.setSenhaHash(gerarHashSenha(novaSenha));
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse alterarBloqueioCliente(Long clienteId, ClienteBloqueioRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de bloqueio nao informados.");
        }

        Usuario usuario = garantirCliente(clienteId);

        if (request.bloqueado()) {
            usuario.setBloqueado(true);
            usuario.setMotivoBloqueio(textoOpcional(request.motivo(), "Cliente desativado pelo administrador."));
            return toUsuarioResponse(usuarioRepository.save(usuario));
        }

        if (clienteTemPendenciaCritica(clienteId)) {
            bloquearCliente(usuario, motivoPendenciaCliente(usuario));
            throw new IllegalStateException("Nao e possivel desbloquear: o cliente possui pendencia ativa.");
        }

        usuario.setBloqueado(false);
        usuario.setMotivoBloqueio("");
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    public RecuperarSenhaCodigoResponse solicitarCodigoRecuperacao(RecuperarSenhaCodigoRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de recuperacao nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();

        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(usuario -> {
            invalidarCodigosRecuperacao(usuario);
            String codigo = gerarCodigoRecuperacao();

            RecuperacaoSenha recuperacao = new RecuperacaoSenha();
            recuperacao.setUsuario(usuario);
            recuperacao.setCodigo(codigo);
            recuperacao.setExpiracao(LocalDateTime.now().plusMinutes(CODIGO_RECUPERACAO_MINUTOS));
            recuperacao.setUtilizado(false);
            recuperacao.setTentativas(0);
            recuperacaoSenhaRepository.save(recuperacao);
            try {
                emailService.enviarCodigoRecuperacao(email, codigo, CODIGO_RECUPERACAO_MINUTOS);
            } catch (IllegalStateException exception) {
                recuperacao.setUtilizado(true);
                recuperacaoSenhaRepository.save(recuperacao);
                LOGGER.warn("Falha ao enviar codigo de recuperacao para {}.", email, exception);
            }
        });

        return new RecuperarSenhaCodigoResponse(MENSAGEM_CODIGO_RECUPERACAO);
    }

    public RecuperarSenhaCodigoResponse verificarCodigoRecuperacao(VerificarCodigoRecuperacaoRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de recuperacao nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String codigo = textoObrigatorio(request.codigo(), "codigo");
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("Codigo invalido ou expirado."));

        validarCodigoRecuperacao(usuario, codigo);
        return new RecuperarSenhaCodigoResponse("Codigo validado. Informe sua nova senha.");
    }

    public UsuarioResponse recuperarSenha(RecuperarSenhaRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de recuperacao nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String codigo = textoObrigatorio(request.codigo(), "codigo");
        String novaSenha = textoObrigatorio(request.novaSenha(), "nova senha");
        String confirmarNovaSenha = textoObrigatorio(request.confirmarNovaSenha(), "confirmacao da nova senha");

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("Codigo invalido ou expirado."));
        RecuperacaoSenha recuperacao = validarCodigoRecuperacao(usuario, codigo);

        if (!novaSenha.equals(confirmarNovaSenha)) {
            throw new IllegalArgumentException("A nova senha e a confirmacao precisam ser iguais.");
        }
        if (novaSenha.length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres.");
        }

        usuario.setSenhaHash(gerarHashSenha(novaSenha));
        recuperacao.setUtilizado(true);
        recuperacaoSenhaRepository.save(recuperacao);
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse loginCliente(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados de login nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String senhaDigitada = textoObrigatorio(request.senha(), "senha");

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("Cliente nao encontrado."));

        String senhaSalva = senhaSalva(usuario);
        if (senhaSalva == null || senhaSalva.isBlank()) {
            throw new IllegalStateException("Esta conta foi criada sem senha. Crie uma nova conta ou atualize a senha no banco.");
        }

        if (!senhaConfere(senhaDigitada, senhaSalva)) {
            throw new IllegalArgumentException("Senha incorreta.");
        }

        return toUsuarioResponse(usuario);
    }

    public List<ReservaResponse> listarReservas() {
        expirarReservasVencidas();
        return reservaRepository.findAll().stream()
            .sorted(Comparator.comparing(Reserva::getId).reversed())
            .map(this::toReservaResponse)
            .toList();
    }

    public List<ReservaResponse> listarReservasDoCliente(Long clienteId) {
        expirarReservasVencidas();
        garantirCliente(clienteId);
        return reservaRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .map(this::toReservaResponse)
            .toList();
    }

    public ReservaResponse criarReserva(ReservaRequest request) {
        expirarReservasVencidas();
        if (request == null || request.clienteId() == null || request.livroId() == null) {
            throw new IllegalArgumentException("Cliente e livro sao obrigatorios para criar a reserva.");
        }

        Usuario cliente = garantirCliente(request.clienteId());
        Livro livro = buscarLivroEntidade(request.livroId());

        garantirClienteSemPendencia(cliente);

        if (quantidadeReservavel(livro) <= 0) {
            throw new IllegalStateException("Livro indisponivel no momento.");
        }

        long livrosEmUsoDoCliente = contarLivrosEmUsoDoCliente(cliente.getId());
        if (livrosEmUsoDoCliente >= LIMITE_EMPRESTIMOS_ATIVOS_POR_CLIENTE) {
            throw new IllegalStateException("Limite de emprestimos atingido. Realize a devolucao para novos emprestimos.");
        }

        boolean jaPossuiReservaPendente = reservaRepository.findByClienteIdOrderByIdDesc(cliente.getId()).stream()
            .anyMatch(reserva -> reserva.getLivro().getId().equals(livro.getId()) && "PENDENTE".equals(reserva.getStatus()));
        if (jaPossuiReservaPendente) {
            throw new IllegalStateException("Este cliente ja possui uma reserva pendente para este livro.");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.setDataReserva(LocalDate.now());
        reserva.setPrazoRetirada(LocalDate.now().plusDays(PRAZO_RETIRADA_DIAS));
        reserva.setStatus("PENDENTE");
        return toReservaResponse(reservaRepository.save(reserva));
    }

    public ReservaResponse cancelarReserva(Long reservaId) {
        Reserva reserva = buscarReserva(reservaId);
        if (!"PENDENTE".equals(reserva.getStatus())) {
            throw new IllegalStateException("Somente reservas pendentes podem ser canceladas.");
        }

        reserva.setStatus("CANCELADA");
        return toReservaResponse(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarEmprestimos() {
        return emprestimoRepository.findAll().stream()
            .map(this::sincronizarStatusEmMemoria)
            .sorted(Comparator.comparing(Emprestimo::getId).reversed())
            .map(this::toEmprestimoResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarEmprestimosDoCliente(Long clienteId) {
        garantirCliente(clienteId);
        return emprestimoRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .map(this::sincronizarStatusEmMemoria)
            .map(this::toEmprestimoResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<DevolucaoResponse> listarDevolucoes() {
        return devolucaoRepository.findAll().stream()
            .sorted(Comparator.comparing(Devolucao::getId).reversed())
            .map(this::toDevolucaoResponse)
            .toList();
    }

    public EmprestimoResponse confirmarRetirada(ConfirmarRetiradaRequest request) {
        if (request == null || request.reservaId() == null) {
            throw new IllegalArgumentException("Informe a reserva para confirmar a retirada.");
        }

        Reserva reserva = buscarReserva(request.reservaId());
        if (!"PENDENTE".equals(reserva.getStatus())) {
            throw new IllegalStateException("A retirada so pode ser confirmada para reservas pendentes.");
        }

        Livro livro = reserva.getLivro();
        if (livro.getQuantidadeDisponivel() <= 0) {
            throw new IllegalStateException("Nao ha estoque disponivel para concluir o emprestimo.");
        }
        garantirClienteSemPendencia(reserva.getCliente());
        if (contarEmprestimosNaoDevolvidos(reserva.getCliente().getId()) >= LIMITE_EMPRESTIMOS_ATIVOS_POR_CLIENTE) {
            throw new IllegalStateException("Limite de emprestimos atingido. Realize a devolucao para novos emprestimos.");
        }

        // O estoque so e baixado quando a retirada acontece de fato, nao no momento da reserva.
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        reserva.setStatus("RETIRADA_CONFIRMADA");
        reservaRepository.save(reserva);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(reserva.getCliente());
        emprestimo.setLivro(livro);
        emprestimo.setReserva(reserva);
        emprestimo.setAdministradorId(request.administradorId() == null ? 1L : request.administradorId());
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataDevolucaoPrevista(LocalDate.now().plusDays(PRAZO_EMPRESTIMO_DIAS));
        emprestimo.setStatus("ATIVO");
        emprestimo.setRenovado(false);
        emprestimo.setEstadoLivro("EMPRESTADO");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoResponse renovarEmprestimo(Long emprestimoId) {
        Emprestimo emprestimo = buscarEmprestimo(emprestimoId);
        String status = calcularStatusEmprestimo(emprestimo);

        if (!"ATIVO".equals(status)) {
            throw new IllegalStateException("Somente emprestimos ativos podem ser renovados.");
        }
        if (emprestimo.isRenovado()) {
            throw new IllegalStateException("Este emprestimo ja foi renovado.");
        }

        emprestimo.setDataDevolucaoPrevista(emprestimo.getDataDevolucaoPrevista().plusDays(PRAZO_RENOVACAO_DIAS));
        emprestimo.setRenovado(true);
        emprestimo.setStatus("ATIVO");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoResponse registrarContatoPendencia(Long emprestimoId, ContatoPendenciaRequest request) {
        Emprestimo emprestimo = buscarEmprestimo(emprestimoId);
        String statusAtual = calcularStatusEmprestimo(emprestimo);
        if (!"ATRASADO".equals(statusAtual) && !"EXTRAVIADO".equals(statusAtual)) {
            throw new IllegalStateException("Contato de pendencia so pode ser registrado para emprestimos atrasados ou extraviados.");
        }

        String canal = textoOpcional(request == null ? null : request.canal(), "CONTATO");
        String observacao = textoObrigatorio(request == null ? null : request.observacao(), "observacao do contato");
        Long administradorId = request == null || request.administradorId() == null ? emprestimo.getAdministradorId() : request.administradorId();
        String registro = LocalDate.now() + " - " + canal.trim().toUpperCase() + " - " + observacao;
        String historicoAtual = textoOpcional(emprestimo.getHistoricoContato(), "");

        emprestimo.setAdministradorId(administradorId);
        emprestimo.setHistoricoContato(historicoAtual.isBlank() ? registro : historicoAtual + "\n" + registro);
        bloquearCliente(emprestimo.getCliente(), "Pendencia de devolucao no emprestimo #" + emprestimo.getId() + ".");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoResponse marcarEmprestimoComoExtraviado(Long emprestimoId, ExtravioRequest request) {
        Emprestimo emprestimo = buscarEmprestimo(emprestimoId);
        String statusAtual = calcularStatusEmprestimo(emprestimo);
        if ("DEVOLVIDO".equals(statusAtual)) {
            throw new IllegalStateException("Emprestimo devolvido nao pode ser marcado como extraviado.");
        }
        if ("EXTRAVIADO".equals(statusAtual)) {
            return toEmprestimoResponse(emprestimo);
        }

        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeTotal(Math.max(0, livro.getQuantidadeTotal() - 1));
        livro.setQuantidadeDisponivel(Math.min(livro.getQuantidadeDisponivel(), livro.getQuantidadeTotal()));
        livroRepository.save(livro);

        Long administradorId = request == null || request.administradorId() == null ? emprestimo.getAdministradorId() : request.administradorId();
        String observacao = textoOpcional(request == null ? null : request.observacao(), "Exemplar marcado como extraviado.");

        emprestimo.setAdministradorId(administradorId);
        emprestimo.setStatus("EXTRAVIADO");
        emprestimo.setEstadoLivro("EXTRAVIADO");
        emprestimo.setObservacaoDevolucao(observacao);
        bloquearCliente(emprestimo.getCliente(), "Emprestimo #" + emprestimo.getId() + " marcado como extraviado.");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public DevolucaoResponse registrarDevolucao(DevolucaoRequest request) {
        if (request == null || request.emprestimoId() == null) {
            throw new IllegalArgumentException("Informe o emprestimo para registrar a devolucao.");
        }

        Emprestimo emprestimo = buscarEmprestimo(request.emprestimoId());
        String statusAtual = calcularStatusEmprestimo(emprestimo);
        if ("DEVOLVIDO".equals(statusAtual)) {
            throw new IllegalStateException("Este emprestimo ja foi devolvido.");
        }
        devolucaoRepository.findByEmprestimoId(emprestimo.getId()).ifPresent(devolucao -> {
            throw new IllegalStateException("Ja existe devolucao registrada para este emprestimo.");
        });

        Livro livro = emprestimo.getLivro();
        // A devolucao nunca pode ultrapassar o estoque fisico cadastrado do livro.
        if ("EXTRAVIADO".equals(statusAtual)) {
            livro.setQuantidadeTotal(livro.getQuantidadeTotal() + 1);
        }
        livro.setQuantidadeDisponivel(Math.min(livro.getQuantidadeTotal(), livro.getQuantidadeDisponivel() + 1));
        livroRepository.save(livro);

        emprestimo.setAdministradorId(request.administradorId() == null ? emprestimo.getAdministradorId() : request.administradorId());
        emprestimo.setStatus("DEVOLVIDO");
        emprestimo.setEstadoLivro(textoOpcional(request.estadoLivro(), "BOM"));
        emprestimo.setObservacaoDevolucao(textoOpcional(request.observacao(), ""));
        emprestimoRepository.save(emprestimo);
        atualizarBloqueioClienteAposRegularizacao(emprestimo.getCliente());

        Devolucao devolucao = new Devolucao();
        devolucao.setEmprestimo(emprestimo);
        devolucao.setCliente(emprestimo.getCliente());
        devolucao.setLivro(livro);
        devolucao.setAdministradorId(emprestimo.getAdministradorId());
        devolucao.setDataDevolucao(LocalDate.now());
        devolucao.setEstadoLivro(emprestimo.getEstadoLivro());
        devolucao.setObservacao(emprestimo.getObservacaoDevolucao());
        devolucao.setStatusDevolucao("REGISTRADA");

        return toDevolucaoResponse(devolucaoRepository.save(devolucao));
    }

    public DashboardResponse buscarDashboard() {
        expirarReservasVencidas();
        List<Livro> livros = livroRepository.findAll();
        List<Reserva> reservas = reservaRepository.findAll();
        List<Emprestimo> emprestimos = emprestimoRepository.findAll().stream()
            .map(this::sincronizarStatusEmMemoria)
            .toList();

        long ativos = emprestimos.stream().filter(item -> "ATIVO".equals(item.getStatus())).count();
        long atrasados = emprestimos.stream().filter(item -> "ATRASADO".equals(item.getStatus())).count();
        long reservasPendentes = reservas.stream().filter(item -> "PENDENTE".equals(item.getStatus())).count();
        long disponiveis = livros.stream().filter(item -> item.getQuantidadeDisponivel() > 0).count();

        return new DashboardResponse(
            livros.size(),
            ativos,
            atrasados,
            usuarioRepository.count(),
            reservasPendentes,
            disponiveis,
            livros.size() - disponiveis
        );
    }

    private void aplicarLivro(Livro livro, BookRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do livro nao informados.");
        }

        String titulo = textoObrigatorio(request.titulo(), "titulo");
        String autor = textoObrigatorio(request.autor(), "autor");
        String categoria = textoObrigatorio(request.categoria(), "categoria");
        String descricao = textoObrigatorio(request.descricao(), "descricao");
        Integer quantidadeTotal = inteiroMinimo(request.quantidadeTotal(), "quantidade total", 0);
        Integer quantidadeDisponivel = inteiroMinimo(request.quantidadeDisponivel(), "quantidade disponivel", 0);

        if (quantidadeDisponivel > quantidadeTotal) {
            throw new IllegalArgumentException("A quantidade disponivel nao pode ser maior que a quantidade total.");
        }

        // Mantem defaults uteis para cadastro rapido sem depender de todos os campos opcionais.
        livro.setTitulo(titulo);
        livro.setAutor(autor);
        livro.setCategoria(categoria);
        livro.setDescricao(descricao);
        livro.setImagemUrl(textoOpcional(request.imagemUrl(), IMAGEM_PADRAO));
        livro.setIsbn(textoOpcional(request.isbn(), "ISBN-PENDENTE"));
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
    }

    private void validarCliente(ClienteRequest request, Long idAtual) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do cliente nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String cpf = textoObrigatorio(request.cpf(), "cpf");

        usuarioRepository.findByEmailIgnoreCase(email)
            .filter(usuario -> !usuario.getId().equals(idAtual))
            .ifPresent(usuario -> {
                throw new IllegalStateException("Ja existe um cliente cadastrado com este e-mail.");
            });

        usuarioRepository.findByCpf(cpf)
            .filter(usuario -> !usuario.getId().equals(idAtual))
            .ifPresent(usuario -> {
                throw new IllegalStateException("Ja existe um cliente cadastrado com este CPF.");
            });
    }

    private String textoObrigatorio(String valor, String campo) {
        if (valor == null || valor.trim().isBlank()) {
            throw new IllegalArgumentException("Informe o campo " + campo + ".");
        }
        return valor.trim();
    }

    private String textoOpcional(String valor, String padrao) {
        return valor == null || valor.trim().isBlank() ? padrao : valor.trim();
    }

    private Integer inteiroMinimo(Integer valor, String campo, int minimo) {
        if (valor == null || valor < minimo) {
            throw new IllegalArgumentException("O campo " + campo + " deve ser maior ou igual a " + minimo + ".");
        }
        return valor;
    }

    private Usuario garantirCliente(Long clienteId) {
        return usuarioRepository.findById(clienteId)
            .orElseThrow(() -> new IllegalArgumentException("Cliente nao encontrado."));
    }

    private Livro buscarLivroEntidade(Long id) {
        return livroRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Livro nao encontrado."));
    }

    private Reserva buscarReserva(Long id) {
        return reservaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada."));
    }

    private Emprestimo buscarEmprestimo(Long id) {
        return emprestimoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emprestimo nao encontrado."));
    }

    private Emprestimo sincronizarStatusEmMemoria(Emprestimo emprestimo) {
        // O status e recalculado em leitura para refletir atraso automaticamente pelo calendario.
        String novoStatus = calcularStatusEmprestimo(emprestimo);
        emprestimo.setStatus(novoStatus);
        return emprestimo;
    }

    private String calcularStatusEmprestimo(Emprestimo emprestimo) {
        if ("DEVOLVIDO".equals(emprestimo.getStatus())) {
            return "DEVOLVIDO";
        }
        if ("EXTRAVIADO".equals(emprestimo.getStatus())) {
            return "EXTRAVIADO";
        }
        if (emprestimo.getDataDevolucaoPrevista() != null && emprestimo.getDataDevolucaoPrevista().isBefore(LocalDate.now())) {
            return "ATRASADO";
        }
        return "ATIVO";
    }

    private LivroResponse toLivroResponse(Livro livro) {
        int quantidadeReservavel = quantidadeReservavel(livro);
        return new LivroResponse(
            livro.getId(),
            livro.getTitulo(),
            livro.getAutor(),
            livro.getCategoria(),
            livro.getDescricao(),
            livro.getImagemUrl(),
            livro.getIsbn(),
            livro.getQuantidadeTotal(),
            livro.getQuantidadeDisponivel(),
            quantidadeReservavel,
            quantidadeReservavel > 0 ? "DISPONIVEL" : "INDISPONIVEL"
        );
    }

    private String gerarHashSenha(String senha) {
        if (senha == null || senha.trim().length() < 6) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres.");
        }
        return passwordEncoder.encode(senha.trim());
    }

    private boolean senhaConfere(String senhaDigitada, String senhaSalva) {
        if (senhaSalva == null || senhaSalva.isBlank()) {
            return false;
        }
        if (senhaSalva.startsWith("$2a$") || senhaSalva.startsWith("$2b$") || senhaSalva.startsWith("$2y$")) {
            return passwordEncoder.matches(senhaDigitada, senhaSalva);
        }
        return senhaDigitada.equals(senhaSalva);
    }

    private String gerarCodigoRecuperacao() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private void invalidarCodigosRecuperacao(Usuario usuario) {
        List<RecuperacaoSenha> codigosAtivos = recuperacaoSenhaRepository.findByUsuarioAndUtilizadoFalse(usuario);
        codigosAtivos.forEach(codigo -> codigo.setUtilizado(true));
        recuperacaoSenhaRepository.saveAll(codigosAtivos);
    }

    private RecuperacaoSenha validarCodigoRecuperacao(Usuario usuario, String codigoDigitado) {
        RecuperacaoSenha recuperacao = recuperacaoSenhaRepository.findTopByUsuarioAndUtilizadoFalseOrderByIdDesc(usuario)
            .orElseThrow(() -> new IllegalArgumentException("Codigo invalido ou expirado."));

        if (Boolean.TRUE.equals(recuperacao.getUtilizado()) || recuperacao.getExpiracao().isBefore(LocalDateTime.now())) {
            recuperacao.setUtilizado(true);
            recuperacaoSenhaRepository.save(recuperacao);
            throw new IllegalArgumentException("Codigo invalido ou expirado.");
        }

        if (recuperacao.getTentativas() >= LIMITE_TENTATIVAS_CODIGO) {
            recuperacao.setUtilizado(true);
            recuperacaoSenhaRepository.save(recuperacao);
            throw new IllegalArgumentException("Limite de tentativas excedido. Solicite um novo codigo.");
        }

        if (!recuperacao.getCodigo().equals(codigoDigitado)) {
            recuperacao.setTentativas(recuperacao.getTentativas() + 1);
            if (recuperacao.getTentativas() >= LIMITE_TENTATIVAS_CODIGO) {
                recuperacao.setUtilizado(true);
            }
            recuperacaoSenhaRepository.save(recuperacao);
            throw new IllegalArgumentException("Codigo invalido ou expirado.");
        }

        return recuperacao;
    }

    private String senhaSalva(Usuario usuario) {
        if (usuario.getSenhaHash() != null && !usuario.getSenhaHash().isBlank()) {
            return usuario.getSenhaHash();
        }
        return usuario.getSenha();
    }

    @Scheduled(fixedDelay = 3600000)
    public void expirarReservasVencidas() {
        List<Reserva> vencidas = reservaRepository.findByStatusAndPrazoRetiradaBefore("PENDENTE", LocalDate.now());
        if (vencidas.isEmpty()) {
            return;
        }

        vencidas.forEach(reserva -> reserva.setStatus("CANCELADA"));
        reservaRepository.saveAll(vencidas);
    }

    private int quantidadeReservavel(Livro livro) {
        long reservasPendentes = reservaRepository.countByLivroIdAndStatus(livro.getId(), "PENDENTE");
        return Math.max(0, livro.getQuantidadeDisponivel() - Math.toIntExact(reservasPendentes));
    }

    private long contarEmprestimosNaoDevolvidos(Long clienteId) {
        return emprestimoRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .filter(emprestimo -> !"DEVOLVIDO".equals(calcularStatusEmprestimo(emprestimo)))
            .count();
    }

    private long contarLivrosEmUsoDoCliente(Long clienteId) {
        long reservasPendentes = reservaRepository.countByClienteIdAndStatus(clienteId, "PENDENTE");
        return contarEmprestimosNaoDevolvidos(clienteId) + reservasPendentes;
    }

    private boolean clienteTemPendenciaCritica(Long clienteId) {
        return emprestimoRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .map(this::calcularStatusEmprestimo)
            .anyMatch(status -> "ATRASADO".equals(status) || "EXTRAVIADO".equals(status));
    }

    private String motivoPendenciaCliente(Usuario usuario) {
        if (Boolean.TRUE.equals(usuario.getBloqueado()) && usuario.getMotivoBloqueio() != null && !usuario.getMotivoBloqueio().isBlank()) {
            return usuario.getMotivoBloqueio();
        }
        return "Cliente possui emprestimo atrasado ou extraviado pendente de regularizacao.";
    }

    private void garantirClienteSemPendencia(Usuario usuario) {
        if (Boolean.TRUE.equals(usuario.getBloqueado()) || clienteTemPendenciaCritica(usuario.getId())) {
            bloquearCliente(usuario, motivoPendenciaCliente(usuario));
            throw new IllegalStateException("Cliente bloqueado por pendencia de devolucao. Regularize antes de novas reservas ou emprestimos.");
        }
    }

    private void bloquearCliente(Usuario usuario, String motivo) {
        usuario.setBloqueado(true);
        usuario.setMotivoBloqueio(textoOpcional(motivo, "Cliente bloqueado por pendencia de devolucao."));
        usuarioRepository.save(usuario);
    }

    private void atualizarBloqueioClienteAposRegularizacao(Usuario usuario) {
        if (!clienteTemPendenciaCritica(usuario.getId())) {
            usuario.setBloqueado(false);
            usuario.setMotivoBloqueio("");
            usuarioRepository.save(usuario);
        }
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        boolean bloqueado = Boolean.TRUE.equals(usuario.getBloqueado()) || clienteTemPendenciaCritica(usuario.getId());
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getTelefone(),
            usuario.getCpf(),
            bloqueado,
            bloqueado ? motivoPendenciaCliente(usuario) : ""
        );
    }

    private ReservaResponse toReservaResponse(Reserva reserva) {
        return new ReservaResponse(
            reserva.getId(),
            reserva.getDataReserva(),
            reserva.getPrazoRetirada(),
            reserva.getStatus(),
            toUsuarioResponse(reserva.getCliente()),
            toLivroResponse(reserva.getLivro())
        );
    }

    private EmprestimoResponse toEmprestimoResponse(Emprestimo emprestimo) {
        return new EmprestimoResponse(
            emprestimo.getId(),
            emprestimo.getReserva() == null ? null : emprestimo.getReserva().getId(),
            emprestimo.getAdministradorId(),
            emprestimo.getDataEmprestimo(),
            emprestimo.getDataDevolucaoPrevista(),
            calcularStatusEmprestimo(emprestimo),
            emprestimo.isRenovado(),
            emprestimo.getEstadoLivro(),
            emprestimo.getObservacaoDevolucao(),
            emprestimo.getHistoricoContato(),
            toUsuarioResponse(emprestimo.getCliente()),
            toLivroResponse(emprestimo.getLivro())
        );
    }

    private DevolucaoResponse toDevolucaoResponse(Devolucao devolucao) {
        return new DevolucaoResponse(
            devolucao.getId(),
            devolucao.getEmprestimo().getId(),
            devolucao.getAdministradorId(),
            devolucao.getDataDevolucao(),
            devolucao.getEstadoLivro(),
            devolucao.getStatusDevolucao(),
            devolucao.getObservacao(),
            toUsuarioResponse(devolucao.getCliente()),
            toLivroResponse(devolucao.getLivro())
        );
    }
}
