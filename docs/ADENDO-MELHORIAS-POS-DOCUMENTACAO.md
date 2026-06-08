# Adendo - Melhorias Implementadas Apos a Documentacao Original

Este levantamento compara o escopo implementado no codigo-fonte atual do TECHBOOK com a documentacao original ja analisada. O foco esta nas funcionalidades, regras, telas, endpoints, classes e alteracoes de banco que ampliaram o sistema depois da aprovacao inicial.

## 1. Recuperacao de Senha por E-mail

1. Nome da funcionalidade: Recuperacao de senha com codigo por e-mail.
2. Objetivo da melhoria: Permitir que o usuario recupere o acesso sem ajuda manual do administrador.
3. Problema que resolve: Antes nao havia fluxo profissional de redefinicao de senha.
4. Beneficio: Usuario recebe um codigo temporario no Gmail e cria nova senha com mais seguranca.
5. Fluxo completo: usuario acessa `recuperar-senha.html`, informa e-mail, backend gera codigo, salva no banco, envia por e-mail, usuario digita codigo, sistema valida, usuario informa nova senha, senha e atualizada e codigo e invalidado.
6. Regras de negocio: codigo de 6 digitos, validade de 10 minutos, uso unico, limite de tentativas, invalidacao dos codigos antigos, mensagem generica para nao revelar se e-mail existe.
7. Telas impactadas: `frontend/recuperar-senha.html`, `frontend/login.html`.
8. Endpoints: `POST /api/clientes/recuperar-senha/codigo`, `POST /api/clientes/recuperar-senha/verificar`, `PUT /api/clientes/recuperar-senha`.
9. Classes Java: `UsuarioController`, `TechbookService`, `EmailService`, `RecuperacaoSenha`, `RecuperacaoSenhaRepository`, `RecuperarSenhaCodigoRequest`, `RecuperarSenhaCodigoResponse`, `RecuperarSenhaRequest`, `VerificarCodigoRecuperacaoRequest`.
10. Banco: tabela `recuperacao_senha` com `id`, `usuario_id`, `codigo`, `expiracao`, `utilizado`, `tentativas`.
11. DER: adicionada entidade `recuperacao_senha`, relacionada N:1 com `usuarios`.
12. Diagrama de Classes: adicionadas classes `RecuperacaoSenha`, `RecuperacaoSenhaRepository`, `EmailService` e DTOs do fluxo.
13. Casos de Uso: novo caso "Recuperar senha".
14. Fluxos do Sistema: novo fluxo de envio, validacao e redefinicao de senha.
15. Evidencias: `UsuarioController.java:60-72`, `TechbookService.java:286-350`, `TechbookService.java:785-818`, `EmailService.java`, `database/criar-recuperacao-senha.sql`, `frontend/js/script.js:275-431`.

## 2. Envio Real de E-mail com Jakarta Mail

1. Nome da funcionalidade: Envio SMTP de codigo de recuperacao.
2. Objetivo: Integrar o backend a um e-mail real.
3. Problema que resolve: Codigo nao deve aparecer na tela; deve chegar ao e-mail do usuario.
4. Beneficio: Fluxo mais profissional e proximo de um sistema real.
5. Fluxo: `TechbookService` solicita envio, `EmailService` monta mensagem, `JavaMailSender` envia para o destinatario.
6. Regras: assunto fixo, corpo padronizado, remetente configuravel, falha de e-mail invalida o codigo.
7. Telas: `recuperar-senha.html`.
8. Endpoints: os mesmos da recuperacao de senha.
9. Classes: `EmailService`, `TechbookService`.
10. Banco: usa `recuperacao_senha`.
11. DER: sem nova entidade alem de `recuperacao_senha`.
12. Diagrama de Classes: adiciona dependencia de servico de e-mail.
13. Casos de Uso: "Enviar codigo de recuperacao".
14. Fluxos: etapa de envio externo por SMTP.
15. Evidencias: `backend/pom.xml` com `spring-boot-starter-mail`, `EmailService.java`, `application.properties`.

## 3. Administrador com Tabela Propria e Token de Sessao

1. Nome: Login administrativo persistido.
2. Objetivo: Substituir credencial fixa por administrador cadastrado no banco.
3. Problema: A documentacao mencionava administrador como entidade, mas antes o login era fixo.
4. Beneficio: Melhor aderencia a modelagem e maior seguranca.
5. Fluxo: ADM faz login, backend consulta tabela `administradores`, valida BCrypt, gera `token_sessao`, frontend guarda token, proximas requisicoes enviam `X-Admin-Token`.
6. Regras: apenas administrador ativo pode logar; senha com BCrypt; operacoes administrativas exigem token valido.
7. Telas: `adm-login.html` e todas as telas ADM.
8. Endpoints: `POST /api/administracao/login`, `GET /api/administracao/dashboard` e endpoints protegidos de livros, usuarios, reservas e emprestimos.
9. Classes: `Administrador`, `AdministradorRepository`, `AdministracaoController`, `TechbookService`, `AdminLoginResponse`, `LoginRequest`.
10. Banco: tabela `administradores` com `id`, `nome`, `email`, `senha_hash`, `ativo`, `token_sessao`.
11. DER: nova entidade `administradores`.
12. Diagrama de Classes: adicionadas classe e repositorio de administrador.
13. Casos de Uso: "Login do administrador" atualizado; "Validar acesso administrativo" adicionado.
14. Fluxos: fluxos administrativos passam a exigir autenticacao.
15. Evidencias: `AdministracaoController.java:30-38`, `TechbookService.java:109-134`, `Administrador.java`, `AdministradorRepository.java`, `database/criar-administradores.sql`, `frontend/js/app.js:22-38`.

## 4. Protecao das Rotas Administrativas

1. Nome: Autorizacao por token nas APIs ADM.
2. Objetivo: Impedir acesso direto sem login.
3. Problema: Endpoints administrativos poderiam ser chamados sem uma sessao de ADM.
4. Beneficio: Mais seguranca para acervo, usuarios, emprestimos e devolucoes.
5. Fluxo: frontend envia `X-Admin-Token`; controller chama `validarTokenAdministrador`; se invalido, API retorna erro.
6. Regras: token obrigatorio para listar clientes, dashboard, listar reservas, emprestimos, devolucoes, cadastrar/editar/excluir livro, confirmar retirada, renovar, contato, extravio e devolucao.
7. Telas: todas as telas `adm*.html`.
8. Endpoints: `GET /api/clientes`, `PATCH /api/clientes/{id}/bloqueio`, `GET /api/reservas`, `GET /api/emprestimos`, `POST /api/emprestimos/confirmar-retirada`, `PATCH /api/emprestimos/{id}/renovar`, `PATCH /api/emprestimos/{id}/contato`, `PATCH /api/emprestimos/{id}/extraviar`, `POST /api/emprestimos/devolucoes`, `GET /api/emprestimos/devolucoes`, `POST/PUT/DELETE /api/livros`.
9. Classes: controllers, `TechbookService`, `AdministradorRepository`.
10. Banco: usa `administradores.token_sessao`.
11. DER: atributo `token_sessao` em `administradores`.
12. Diagrama de Classes: metodo `validarTokenAdministrador`.
13. Casos de Uso: todos os casos administrativos passam a incluir autenticacao.
14. Fluxos: etapa inicial de validacao de token.
15. Evidencias: `TechbookService.java:130-134`, `frontend/js/app.js:34`, controllers com `@RequestHeader("X-Admin-Token")`.

## 5. Perfil do Usuario, Alteracao de Dados e Alteracao de Senha Logada

1. Nome: Minha conta.
2. Objetivo: Permitir que o cliente gerencie seus dados.
3. Problema: Usuario dependia de cadastro inicial e nao tinha area propria completa.
4. Beneficio: Usuario atualiza perfil e senha sem suporte do ADM.
5. Fluxo: usuario logado abre `minha-conta.html`, edita dados, salva; para senha, informa senha atual, nova senha e confirmacao.
6. Regras: e-mail e CPF nao podem duplicar; senha nova deve ter pelo menos 6 caracteres; senha atual deve conferir.
7. Telas: `minha-conta.html`, menu do usuario.
8. Endpoints: `GET /api/clientes/{clienteId}`, `PUT /api/clientes/{clienteId}`, `PUT /api/clientes/{clienteId}/senha`.
9. Classes: `UsuarioController`, `TechbookService`, `Usuario`, `AlterarSenhaRequest`, `ClienteRequest`.
10. Banco: usa `usuarios.senha_hash`; preserva `usuarios.senha` para compatibilidade.
11. DER: atributo `senha_hash` em `usuarios`.
12. Diagrama de Classes: metodo `alterarSenha` e DTO `AlterarSenhaRequest`.
13. Casos de Uso: "Consultar/editar minha conta", "Alterar senha logado".
14. Fluxos: fluxo de edicao de perfil e fluxo de troca de senha.
15. Evidencias: `frontend/minha-conta.html`, `frontend/js/script.js:441-941`, `UsuarioController.java:75-83`, `TechbookService.java:223-260`.

## 6. Bloqueio e Desativacao de Cliente

1. Nome: Bloqueio administrativo de cliente.
2. Objetivo: Impedir novas reservas/retiradas sem apagar historico.
3. Problema: Excluir usuario com historico quebraria reservas, emprestimos e devolucoes.
4. Beneficio: ADM preserva rastreabilidade e controla pendencias.
5. Fluxo: ADM abre clientes, seleciona cliente, informa motivo, bloqueia; ao tentar desbloquear, sistema verifica pendencias criticas.
6. Regras: cliente bloqueado nao reserva nem retira; cliente com atraso/extravio nao pode ser desbloqueado; motivo fica salvo.
7. Telas: `adm-usuarios.html`, `livro.html` indiretamente por impedir reserva.
8. Endpoints: `GET /api/clientes`, `PATCH /api/clientes/{clienteId}/bloqueio`, `POST /api/reservas`, `POST /api/emprestimos/confirmar-retirada`.
9. Classes: `Usuario`, `ClienteBloqueioRequest`, `UsuarioController`, `TechbookService`.
10. Banco: colunas `usuarios.bloqueado`, `usuarios.motivo_bloqueio`.
11. DER: novos atributos em `usuarios`.
12. Diagrama de Classes: atributos `bloqueado` e `motivoBloqueio`; metodos `alterarBloqueioCliente`, `garantirClienteSemPendencia`.
13. Casos de Uso: "Bloquear cliente", "Desbloquear cliente".
14. Fluxos: reserva e retirada passam a validar pendencia.
15. Evidencias: `Usuario.java`, `UsuarioController.java:85-93`, `TechbookService.java:263-283`, `TechbookService.java:406`, `TechbookService.java:482`, `frontend/js/adm.js:1739-1779`.

## 7. Protecao Contra Exclusao Manual de Usuario no Banco

1. Nome: Trigger de protecao de exclusao.
2. Objetivo: Impedir exclusao de usuario com historico.
3. Problema: Exclusao manual poderia corromper relacionamentos.
4. Beneficio: Integridade do banco e preservacao historica.
5. Fluxo: tentativa de `DELETE` em `usuarios`; trigger conta vinculos em reservas, emprestimos e devolucoes; se houver vinculo, bloqueia.
6. Regras: usuario com historico nao pode ser apagado manualmente; deve ser bloqueado/desativado.
7. Telas: nenhuma direta; reforca `adm-usuarios.html`.
8. Endpoints: nenhum direto.
9. Classes Java: nenhuma; regra no banco.
10. Banco: trigger `trg_usuarios_bloqueia_delete_com_vinculo`.
11. DER: sem entidade nova; reforco de integridade.
12. Diagrama de Classes: sem alteracao.
13. Casos de Uso: complementa "Bloquear/desativar cliente".
14. Fluxos: substitui exclusao por bloqueio.
15. Evidencias: `database/proteger-exclusao-usuarios.sql`, `database/techbook.sql:204-219`.

## 8. Controle de Extravio de Livro

1. Nome: Marcar emprestimo como extraviado.
2. Objetivo: Registrar perda de exemplar.
3. Problema: Antes nao havia controle formal para livro perdido.
4. Beneficio: ADM ajusta acervo e bloqueia cliente com pendencia.
5. Fluxo: ADM identifica emprestimo atrasado, abre acao de extravio, informa observacao, backend marca status `EXTRAVIADO`, reduz estoque total e bloqueia cliente.
6. Regras: emprestimo devolvido nao pode ser extraviado; extravio reduz `quantidade_total`; cliente fica bloqueado; se devolvido depois, total e restaurado.
7. Telas: `adm-atrasos.html`, `adm-emprestimo.html`, `adm-devolucao.html`, `adm-usuarios.html`.
8. Endpoints: `PATCH /api/emprestimos/{id}/extraviar`, `POST /api/emprestimos/devolucoes`.
9. Classes: `EmprestimoController`, `TechbookService`, `ExtravioRequest`, `Emprestimo`, `Livro`, `Usuario`.
10. Banco: colunas `emprestimos.status`, `emprestimos.estado_livro`, `emprestimos.observacao_devolucao`, `livros.quantidade_total`, `usuarios.bloqueado`.
11. DER: atributos de status/estado/observacao em `emprestimos`; impacto em `livros` e `usuarios`.
12. Diagrama de Classes: metodo `marcarEmprestimoComoExtraviado`; DTO `ExtravioRequest`.
13. Casos de Uso: "Marcar livro como extraviado".
14. Fluxos: novo fluxo para pendencia critica e ajuste de estoque.
15. Evidencias: `EmprestimoController.java:73-81`, `TechbookService.java:543-567`, `TechbookService.java:586-590`, `frontend/js/adm.js:1607-1627`.

## 9. Registro de Contato com Cliente em Pendencia

1. Nome: Historico de contato de pendencia.
2. Objetivo: Registrar tentativas de contato sobre atrasos/extravios.
3. Problema: ADM nao tinha historico formal de cobranca/contato.
4. Beneficio: Ajuda acompanhamento administrativo.
5. Fluxo: ADM abre emprestimo atrasado/extraviado, informa canal e observacao, sistema concatena registro no historico.
6. Regras: so pode registrar contato em emprestimo `ATRASADO` ou `EXTRAVIADO`; observacao e obrigatoria; cliente e bloqueado.
7. Telas: `adm-atrasos.html`.
8. Endpoints: `PATCH /api/emprestimos/{id}/contato`.
9. Classes: `ContatoPendenciaRequest`, `EmprestimoController`, `TechbookService`, `Emprestimo`.
10. Banco: coluna `emprestimos.historico_contato`.
11. DER: novo atributo em `emprestimos`.
12. Diagrama de Classes: metodo `registrarContatoPendencia`; DTO `ContatoPendenciaRequest`.
13. Casos de Uso: "Registrar contato de pendencia".
14. Fluxos: acompanhamento de atraso ganha registro de contato.
15. Evidencias: `EmprestimoController.java:63-71`, `TechbookService.java:524-541`, `Emprestimo.java`, `frontend/js/adm.js:1579-1605`.

## 10. Renovacao Unica de Emprestimo

1. Nome: Renovacao de emprestimo.
2. Objetivo: Permitir prolongar prazo uma vez.
3. Problema: Emprestimo ativo nao tinha extensao controlada.
4. Beneficio: Usuario ganha flexibilidade; ADM mantem controle.
5. Fluxo: ADM seleciona emprestimo ativo, confirma renovacao, sistema soma 7 dias e marca `renovado=true`.
6. Regras: apenas emprestimo `ATIVO`; nao pode renovar atrasado, devolvido, extraviado ou ja renovado.
7. Telas: `adm-emprestimo.html`.
8. Endpoints: `PATCH /api/emprestimos/{id}/renovar`.
9. Classes: `EmprestimoController`, `TechbookService`, `Emprestimo`, `EmprestimoResponse`.
10. Banco: coluna `emprestimos.renovado`.
11. DER: atributo `renovado` em `emprestimos`.
12. Diagrama de Classes: metodo `renovarEmprestimo`.
13. Casos de Uso: "Renovar emprestimo".
14. Fluxos: fluxo de emprestimo ativo ganha etapa de renovacao.
15. Evidencias: `EmprestimoController.java:54-61`, `TechbookService.java:507-522`, `frontend/js/adm.js:1145-1165`.

## 11. Historico do Usuario

1. Nome: Meu historico.
2. Objetivo: Mostrar ao usuario suas movimentacoes.
3. Problema: Usuario via reservas, mas nao tinha visao historica consolidada.
4. Beneficio: Transparencia sobre reservas e emprestimos.
5. Fluxo: usuario logado acessa `meu-historico.html`; frontend busca reservas e emprestimos do usuario; renderiza registros.
6. Regras: precisa estar logado; mostra dados apenas do cliente da sessao.
7. Telas: `meu-historico.html`, menu do usuario.
8. Endpoints: `GET /api/clientes/{clienteId}/reservas`, `GET /api/clientes/{clienteId}/emprestimos`.
9. Classes: `UsuarioController`, `TechbookService`, `ReservaResponse`, `EmprestimoResponse`.
10. Banco: usa `reservas` e `emprestimos`.
11. DER: sem nova entidade.
12. Diagrama de Classes: sem classe nova; uso de DTOs existentes.
13. Casos de Uso: "Consultar historico do usuario".
14. Fluxos: novo fluxo de consulta historica.
15. Evidencias: `frontend/meu-historico.html`, `frontend/js/catalogo.js:666-704`, `UsuarioController.java:95-102`.

## 12. Meus Emprestimos

1. Nome: Consulta de emprestimos do cliente.
2. Objetivo: Permitir que o usuario acompanhe prazos e status dos emprestimos.
3. Problema: Usuario dependia do ADM para saber situacao de emprestimo.
4. Beneficio: Melhor acompanhamento de devolucao.
5. Fluxo: usuario logado acessa `meus-emprestimos.html`; sistema lista emprestimos do cliente.
6. Regras: apenas usuario logado; dados filtrados pelo cliente.
7. Telas: `meus-emprestimos.html`.
8. Endpoints: `GET /api/clientes/{clienteId}/emprestimos`.
9. Classes: `UsuarioController`, `TechbookService`, `EmprestimoResponse`.
10. Banco: `emprestimos`.
11. DER: sem entidade nova.
12. Diagrama de Classes: sem classe nova.
13. Casos de Uso: "Consultar meus emprestimos".
14. Fluxos: novo fluxo de acompanhamento do emprestimo pelo usuario.
15. Evidencias: `frontend/meus-emprestimos.html`, `frontend/js/catalogo.js:640-663`, `UsuarioController.java:100-102`.

## 13. Sugestao de Livros Semelhantes

1. Nome: Sugestoes semelhantes.
2. Objetivo: Oferecer alternativas de leitura.
3. Problema: Usuario ficava sem alternativa clara quando livro estava indisponivel.
4. Beneficio: Melhora navegacao e incentiva uso do acervo.
5. Fluxo: tela do livro carrega livro atual e catalogo; calcula semelhanca por categoria, autor e palavras do titulo; exibe cards disponiveis.
6. Regras: nao sugere o proprio livro; apenas livros com `quantidadeReservavel > 0`; quando indisponivel, usa fallback por disponibilidade.
7. Telas: `livro.html`.
8. Endpoints: `GET /api/livros/{id}`, `GET /api/livros`.
9. Classes: `LivroController`, `TechbookService`, `LivroResponse`.
10. Banco: usa `livros`, `reservas` para quantidade reservavel.
11. DER: sem nova entidade.
12. Diagrama de Classes: sem classe nova.
13. Casos de Uso: "Visualizar sugestoes semelhantes".
14. Fluxos: fluxo de detalhe do livro ganha etapa de sugestao.
15. Evidencias: `frontend/js/catalogo.js:6-59`, `frontend/js/catalogo.js:491`, `frontend/css/catalogo.css`.

## 14. Livros Mais Reservados / Mais Procurados

1. Nome: Ranking de livros mais procurados.
2. Objetivo: Destacar titulos com maior demanda.
3. Problema: Catalogo nao indicava livros populares.
4. Beneficio: Usuario encontra obras relevantes; ADM visualiza demanda.
5. Fluxo: backend conta reservas e emprestimos por livro, ordena, limita a 6; frontend exibe no catalogo.
6. Regras: considera reservas e emprestimos; so exibe livros com procura maior que zero; ordena por procura e titulo.
7. Telas: `catalogo.html`, `adm.html`.
8. Endpoints: `GET /api/livros/mais-procurados`.
9. Classes: `LivroController`, `TechbookService`, `LivroResponse`.
10. Banco: usa `livros`, `reservas`, `emprestimos`.
11. DER: sem nova entidade.
12. Diagrama de Classes: metodo `listarLivrosMaisProcurados`.
13. Casos de Uso: "Consultar livros mais procurados".
14. Fluxos: catalogo ganha area de destaque.
15. Evidencias: `LivroController.java:40-43`, `TechbookService.java:149-168`, `frontend/js/catalogo.js:62-99`, `frontend/js/catalogo.js:276`.

## 15. Carrossel Interativo e Paginacao do Catalogo

1. Nome: Organizacao avancada do catalogo.
2. Objetivo: Melhorar visualizacao dos livros.
3. Problema: Muitos livros em uma pagina longa prejudicam navegacao.
4. Beneficio: Tela mais organizada, com navegacao por paginas e carrossel.
5. Fluxo: catalogo carrega livros, aplica busca/filtro, divide em paginas de 15 e mostra ranking em carrossel.
6. Regras: 15 livros por pagina; filtro por termo e categoria; carrossel com setas, pontos e arraste.
7. Telas: `catalogo.html`.
8. Endpoints: `GET /api/livros`, `GET /api/livros/mais-procurados`.
9. Classes: `LivroController`, `TechbookService`.
10. Banco: `livros`.
11. DER: sem alteracao.
12. Diagrama de Classes: sem alteracao backend.
13. Casos de Uso: "Pesquisar/filtrar catalogo".
14. Fluxos: busca e navegacao do catalogo foram detalhadas.
15. Evidencias: `frontend/js/catalogo.js:249-379`, `frontend/js/catalogo.js:101-199`.

## 16. Dashboard Administrativo Avancado

1. Nome: Dashboard com indicadores inteligentes.
2. Objetivo: Dar visao gerencial ao administrador.
3. Problema: Dashboard basico nao mostrava demanda, risco e atividade recente.
4. Beneficio: ADM toma decisoes melhores sobre estoque e pendencias.
5. Fluxo: tela ADM busca dashboard, livros, reservas, emprestimos, usuarios e devolucoes; frontend calcula rankings, riscos, categorias, alertas e atividades.
6. Regras: risco considera demanda e baixo estoque; alertas consideram reservas pendentes, atrasos, livros indisponiveis e reservas vencendo.
7. Telas: `adm.html`.
8. Endpoints: `GET /api/administracao/dashboard`, `GET /api/livros`, `GET /api/reservas`, `GET /api/emprestimos`, `GET /api/clientes`, `GET /api/emprestimos/devolucoes`.
9. Classes: `DashboardResponse`, `AdministracaoController`, `TechbookService`.
10. Banco: usa `livros`, `reservas`, `emprestimos`, `usuarios`, `devolucoes`.
11. DER: sem entidade nova.
12. Diagrama de Classes: DTO `DashboardResponse`; metodo `buscarDashboard`.
13. Casos de Uso: "Consultar dashboard administrativo".
14. Fluxos: novo fluxo de analise gerencial.
15. Evidencias: `AdministracaoController.java:30-34`, `TechbookService.java:611-633`, `frontend/js/adm.js:197-550`, `frontend/adm.html`.

## 17. Notificacoes Administrativas

1. Nome: Gaveta de notificacoes do ADM.
2. Objetivo: Centralizar alertas e falhas.
3. Problema: Erros apareciam isolados e podiam ser perdidos.
4. Beneficio: ADM visualiza falhas administrativas e risco de falta.
5. Fluxo: erro ocorre ou risco e calculado; frontend registra em `localStorage`; botao de notificacoes mostra contador; ADM abre gaveta.
6. Regras: guarda ultimas 6 falhas; falhas de retirada/devolucao recebem contexto especifico; contador soma falhas e riscos.
7. Telas: `adm.html` e fluxos ADM.
8. Endpoints: indiretos, principalmente `POST /api/emprestimos/confirmar-retirada`, `POST /api/emprestimos/devolucoes`.
9. Classes: sem classe Java nova; depende dos erros das APIs.
10. Banco: sem tabela; persistencia local no navegador.
11. DER: sem alteracao.
12. Diagrama de Classes: sem alteracao backend.
13. Casos de Uso: "Receber notificacao administrativa".
14. Fluxos: erro de retirada/devolucao passa a gerar aviso formal na interface.
15. Evidencias: `frontend/js/adm.js:670-733`, `frontend/js/adm.js:747-833`, `frontend/js/adm.js:2361-2370`, `frontend/js/adm.js:2417-2426`, `frontend/css/adm.css:815-838`.

## 18. Filtros e Paginacao nas Telas ADM

1. Nome: Filtros administrativos.
2. Objetivo: Facilitar gestao com muitos registros.
3. Problema: Listas grandes ficavam dificeis de consultar.
4. Beneficio: ADM encontra rapidamente livros, usuarios, emprestimos, atrasos, reservas e devolucoes.
5. Fluxo: ADM digita filtro ou seleciona status/categoria/periodo; frontend filtra cache e pagina resultados.
6. Regras: filtros por termo, status, categoria, estado do livro, mes, ano e tamanho de pagina conforme tela.
7. Telas: `adm-livros.html`, `adm-usuarios.html`, `adm-emprestimo.html`, `adm-atrasos.html`, `adm-reservas.html`, `adm-devolucao.html`.
8. Endpoints: APIs de listagem administrativas.
9. Classes: sem novas classes; usa DTOs existentes.
10. Banco: sem alteracao.
11. DER: sem alteracao.
12. Diagrama de Classes: sem alteracao.
13. Casos de Uso: "Filtrar registros administrativos".
14. Fluxos: todos os fluxos ADM de consulta ganham busca/filtro.
15. Evidencias: `frontend/js/adm.js:75-112`, `frontend/js/adm.js:2163-2188`, variaveis de paginacao em `frontend/js/adm.js:17-31`.

## 19. Historico de Devolucoes com Estado Fisico

1. Nome: Registro detalhado de devolucao.
2. Objetivo: Guardar estado fisico e observacao no retorno do livro.
3. Problema: Devolucao simples nao registrava qualidade do exemplar.
4. Beneficio: ADM acompanha conservacao do acervo.
5. Fluxo: ADM seleciona emprestimo, informa estado e observacao, backend cria `devolucoes` e atualiza emprestimo.
6. Regras: nao permite devolucao duplicada; devolucao restaura disponibilidade sem ultrapassar total; extravio devolvido restaura total.
7. Telas: `adm-devolucao.html`, `adm-emprestimo.html`, `adm-atrasos.html`.
8. Endpoints: `POST /api/emprestimos/devolucoes`, `GET /api/emprestimos/devolucoes`.
9. Classes: `Devolucao`, `DevolucaoRepository`, `DevolucaoRequest`, `DevolucaoResponse`, `EmprestimoController`, `TechbookService`.
10. Banco: tabela `devolucoes`; colunas `emprestimos.estado_livro`, `emprestimos.observacao_devolucao`.
11. DER: entidade `devolucoes` relacionada 1:1 com `emprestimos`, N:1 com `usuarios` e `livros`.
12. Diagrama de Classes: adicionada/fortalecida classe `Devolucao`.
13. Casos de Uso: "Registrar devolucao detalhada".
14. Fluxos: fluxo de devolucao ganha estado fisico, observacao e historico.
15. Evidencias: `Devolucao.java`, `EmprestimoController.java:83-97`, `TechbookService.java:569-609`, `frontend/js/adm.js:2373-2428`.

## 20. Controle de Disponibilidade Considerando Reservas Pendentes

1. Nome: Quantidade reservavel.
2. Objetivo: Evitar reservar exemplar ja comprometido por reserva pendente.
3. Problema: Apenas `quantidade_disponivel` nao refletia reservas ainda nao retiradas.
4. Beneficio: Evita excesso de reservas.
5. Fluxo: ao listar livro, backend calcula `quantidadeReservavel = quantidadeDisponivel - reservasPendentes`; frontend usa esse valor para permitir/impedir reserva.
6. Regras: se quantidade reservavel for zero, livro fica indisponivel para reserva; botao de reservar e desativado.
7. Telas: `catalogo.html`, `livro.html`.
8. Endpoints: `GET /api/livros`, `GET /api/livros/{id}`, `POST /api/reservas`.
9. Classes: `LivroResponse`, `TechbookService`.
10. Banco: usa `reservas.status` e `livros.quantidade_disponivel`.
11. DER: sem entidade nova.
12. Diagrama de Classes: DTO `LivroResponse` inclui `quantidadeReservavel`.
13. Casos de Uso: "Verificar disponibilidade real".
14. Fluxos: reserva usa disponibilidade calculada.
15. Evidencias: `TechbookService.java:742-756`, `TechbookService.java:831-834`, `frontend/js/catalogo.js:335-337`, `frontend/js/catalogo.js:575-577`.

## 21. Impedimento de Reserva Duplicada e Limite Combinado de 3 Itens

1. Nome: Controle ampliado de limite de reserva/emprestimo.
2. Objetivo: Evitar abuso e duplicidade.
3. Problema: Usuario poderia reservar mesmo livro ou ultrapassar limite combinando reservas e emprestimos.
4. Beneficio: Acervo fica mais justo para todos.
5. Fluxo: ao reservar, backend verifica pendencias, disponibilidade, total de itens em uso e reserva pendente duplicada.
6. Regras: limite de 3 considera reservas pendentes + emprestimos nao devolvidos; nao permite duas reservas pendentes do mesmo livro.
7. Telas: `livro.html`, `minhas-reservas.html`.
8. Endpoints: `POST /api/reservas`.
9. Classes: `ReservaController`, `TechbookService`, `ReservaRequest`, `ReservaResponse`.
10. Banco: usa `reservas.status`, `emprestimos.status`.
11. DER: sem nova entidade.
12. Diagrama de Classes: metodos `contarLivrosEmUsoDoCliente` e `criarReserva`.
13. Casos de Uso: "Reservar livro" atualizado.
14. Fluxos: validacoes antes da criacao da reserva.
15. Evidencias: `TechbookService.java:397-430`, `TechbookService.java:839-845`, `frontend/js/catalogo.js:561-577`.

## 22. Expiracao Automatica de Reservas

1. Nome: Expiracao automatica de reservas vencidas.
2. Objetivo: Liberar reservas nao retiradas.
3. Problema: Reservas pendentes vencidas poderiam prender disponibilidade.
4. Beneficio: Livros retornam ao fluxo de reserva.
5. Fluxo: metodo agendado executa periodicamente; busca reservas `PENDENTE` com prazo anterior a hoje; altera status.
6. Regras: roda a cada 1 hora; reserva vencida e marcada como `CANCELADA` no codigo atual.
7. Telas: catalogo, reservas e painel ADM sao impactados indiretamente.
8. Endpoints: qualquer listagem chama `expirarReservasVencidas`; agendamento tambem executa.
9. Classes: `TechbookService`, `ReservaRepository`, `TechbookApplication` com `@EnableScheduling`.
10. Banco: usa `reservas.status`, `reservas.prazo_retirada`.
11. DER: sem entidade nova.
12. Diagrama de Classes: metodo agendado `expirarReservasVencidas`.
13. Casos de Uso: "Expirar reserva vencida".
14. Fluxos: fluxo de reserva ganha liberacao automatica.
15. Evidencias: `TechbookService.java:821-829`, chamadas em `TechbookService.java:137`, `145`, `150`, `382`, `390`, `398`, `612`.

## 23. Impedimento de Exclusao de Livro com Operacao Ativa

1. Nome: Protecao de exclusao de livro.
2. Objetivo: Preservar historico e operacoes ativas.
3. Problema: Excluir livro ativo quebraria reserva/emprestimo.
4. Beneficio: Integridade do sistema.
5. Fluxo: ADM tenta excluir; backend verifica reservas nao canceladas e emprestimos nao devolvidos; se houver, bloqueia.
6. Regras: nao excluir livro com reserva ativa ou emprestimo ativo/atrasado/extraviado.
7. Telas: `adm-livros.html`.
8. Endpoints: `DELETE /api/livros/{id}`.
9. Classes: `LivroController`, `TechbookService`.
10. Banco: usa `livros`, `reservas`, `emprestimos`.
11. DER: sem alteracao.
12. Diagrama de Classes: metodo `excluirLivro`.
13. Casos de Uso: "Excluir livro" atualizado.
14. Fluxos: exclusao ganha validacao previa.
15. Evidencias: `LivroController.java:70-77`, `TechbookService.java:182-195`, `frontend/js/adm.js:2488-2505`.

## 24. Tratamento Padronizado de Erros da API

1. Nome: Respostas de erro padronizadas.
2. Objetivo: Retornar mensagens consistentes ao frontend.
3. Problema: Erros poderiam aparecer de forma confusa.
4. Beneficio: Usuario e ADM recebem feedback mais claro.
5. Fluxo: excecao e capturada por `ApiExceptionHandler`; resposta JSON contem campo `erro`.
6. Regras: `IllegalArgumentException` retorna 400; `IllegalStateException` retorna 409; erro inesperado retorna 503 com mensagem generica.
7. Telas: todas as telas que consomem API.
8. Endpoints: todos.
9. Classes: `ApiExceptionHandler`.
10. Banco: sem alteracao.
11. DER: sem alteracao.
12. Diagrama de Classes: classe de tratamento global de erro.
13. Casos de Uso: todos ganham fluxo alternativo de erro.
14. Fluxos: padronizacao dos cenarios de falha.
15. Evidencias: `backend/src/main/java/com/techbook/api/ApiExceptionHandler.java`, `frontend/js/app.js:42-64`.

## 25. CORS, Scripts de Execucao, Guias e Dados de Teste

1. Nome: Melhorias tecnicas de execucao e manutencao.
2. Objetivo: Facilitar instalacao, execucao e apresentacao.
3. Problema: Projeto manualmente mais dificil de rodar e explicar.
4. Beneficio: Equipe consegue preparar ambiente com menos erro.
5. Fluxo: scripts preparam banco, iniciam backend e abrem frontend; guias explicam estrutura.
6. Regras: usar banco `techbook`; MySQL/XAMPP; backend Spring Boot.
7. Telas: nao se aplica diretamente.
8. Endpoints: nao se aplica.
9. Classes: `CorsConfig`, `DataInitializer`.
10. Banco: `database/techbook.sql`, scripts de migracao e correcao.
11. DER: documentado em `docs/MER-DER-TECHBOOK.md`.
12. Diagrama de Classes: sem impacto funcional, mas documentacao deve citar inicializador.
13. Casos de Uso: tecnico interno.
14. Fluxos: fluxo de instalacao e preparacao.
15. Evidencias: `ABRIR-TECHBOOK.bat`, `PREPARAR-BANCO-TECHBOOK.ps1`, `PREPARAR-E-ABRIR-TECHBOOK.bat`, `GUIA-INSTALACAO-E-CONEXAO.md`, `GUIA-DE-CONTROLE-DO-PROJETO.md`, `CorsConfig.java`, `DataInitializer.java`.

## A) Novas Regras de Negocio

| Regra | Descricao | Justificativa | Onde esta implementada | Impacto |
| --- | --- | --- | --- | --- |
| Codigo temporario de recuperacao | Codigo de 6 digitos, 10 minutos, uso unico e limite de tentativas | Proteger redefinicao de senha | `TechbookService.java:286-350`, `785-818` | Aumenta seguranca do login |
| E-mail nao revelado | Mensagem generica na solicitacao de recuperacao | Evitar descoberta de contas cadastradas | `TechbookService.java:286-314` | Mais privacidade |
| Invalidar codigos antigos | Novo codigo inutiliza anteriores | Evitar uso indevido | `TechbookService.java:777-783` | Recuperacao mais segura |
| Senha com minimo de 6 caracteres | Cadastro, troca e recuperacao exigem tamanho minimo | Evitar senhas fracas | `TechbookService.java:236-260`, `330-350`, `758-763` | Mais seguranca |
| Administrador ativo | Apenas ADM ativo pode logar | Controlar acesso | `TechbookService.java:109-128` | Acesso administrativo mais seguro |
| Token administrativo obrigatorio | Rotas ADM exigem `X-Admin-Token` | Proteger operacoes sensiveis | `TechbookService.java:130-134`, controllers | Evita acesso indevido |
| Bloqueio por pendencia | Cliente bloqueado ou com atraso/extravio nao reserva/retira | Controlar inadimplencia | `TechbookService.java:860-866` | Reduz risco operacional |
| Desbloqueio condicionado | Cliente com pendencia critica nao pode ser desbloqueado | Evitar liberacao indevida | `TechbookService.java:276-280` | Mantem disciplina do acervo |
| Limite combinado de 3 itens | Reservas pendentes + emprestimos nao devolvidos contam no limite | Evitar acumulacao de livros | `TechbookService.java:413-416`, `839-845` | Distribuicao justa |
| Impedimento de reserva duplicada | Cliente nao pode ter reserva pendente do mesmo livro | Evitar duplicidade | `TechbookService.java:418-423` | Melhora disponibilidade |
| Disponibilidade reservavel | Disponibilidade considera reservas pendentes | Evitar overbooking | `TechbookService.java:831-834` | Estoque mais correto |
| Expiracao automatica | Reservas vencidas sao canceladas automaticamente | Liberar acervo | `TechbookService.java:821-829` | Atualiza disponibilidade |
| Confirmacao baixa estoque | Estoque so diminui na retirada | Reserva nao retira fisicamente o livro | `TechbookService.java:488-490` | Controle realista |
| Renovacao unica | Emprestimo ativo pode renovar apenas uma vez | Controlar prazo | `TechbookService.java:507-522` | Evita extensao sem limite |
| Contato apenas para pendencia | Contato so em atraso/extravio | Registrar cobranca relevante | `TechbookService.java:524-541` | Historico administrativo |
| Extravio reduz acervo | Livro extraviado diminui quantidade total | Representar perda fisica | `TechbookService.java:543-567` | Estoque fiel |
| Devolucao de extravio restaura total | Livro recuperado volta ao acervo | Corrigir perda revertida | `TechbookService.java:586-590` | Acervo atualizado |
| Devolucao unica | Um emprestimo nao pode ter duas devolucoes | Evitar duplicidade | `TechbookService.java:579-583` | Historico consistente |
| Excluir livro protegido | Livro com operacao ativa nao pode ser excluido | Preservar historico | `TechbookService.java:182-195` | Integridade |
| Excluir usuario protegido por trigger | Usuario com vinculos nao pode ser apagado no banco | Preservar relacoes | `database/proteger-exclusao-usuarios.sql` | Integridade referencial |

## B) Novas Tabelas do Banco

### `administradores`

- Finalidade: armazenar administradores, senha segura, status ativo e token de sessao.
- Campos: `id`, `nome`, `email`, `senha_hash`, `ativo`, `token_sessao`.
- Chave primaria: `id`.
- Chaves estrangeiras: nenhuma.
- Relacionamentos: entidade independente usada para autenticacao administrativa.
- Evidencia: `database/criar-administradores.sql`.

### `recuperacao_senha`

- Finalidade: armazenar codigos temporarios de recuperacao de senha.
- Campos: `id`, `usuario_id`, `codigo`, `expiracao`, `utilizado`, `tentativas`.
- Chave primaria: `id`.
- Chaves estrangeiras: `usuario_id` referencia `usuarios(id)`.
- Relacionamentos: muitos codigos de recuperacao podem pertencer a um usuario.
- Evidencia: `database/criar-recuperacao-senha.sql`.

## C) Novos Casos de Uso

1. Recuperar senha por e-mail.
2. Verificar codigo de recuperacao.
3. Definir nova senha.
4. Login do administrador com token.
5. Validar token administrativo.
6. Editar dados da minha conta.
7. Alterar senha logado.
8. Consultar meus emprestimos.
9. Consultar meu historico.
10. Bloquear cliente.
11. Desbloquear cliente.
12. Registrar contato de pendencia.
13. Marcar emprestimo como extraviado.
14. Renovar emprestimo.
15. Consultar livros mais procurados.
16. Visualizar sugestoes semelhantes.
17. Receber notificacoes administrativas.
18. Filtrar registros administrativos.
19. Consultar dashboard administrativo avancado.
20. Excluir livro com validacao de operacao ativa.

## D) Novos Fluxos

### Recuperacao de senha

1. Usuario acessa `recuperar-senha.html`.
2. Informa e-mail.
3. Sistema chama `POST /api/clientes/recuperar-senha/codigo`.
4. Backend invalida codigos antigos.
5. Backend gera codigo de 6 digitos e salva em `recuperacao_senha`.
6. `EmailService` envia codigo.
7. Usuario informa codigo.
8. Sistema chama `POST /api/clientes/recuperar-senha/verificar`.
9. Usuario informa nova senha e confirmacao.
10. Sistema chama `PUT /api/clientes/recuperar-senha`.
11. Backend altera `usuarios.senha_hash` e marca codigo como utilizado.

### Bloqueio de cliente

1. ADM acessa `adm-usuarios.html`.
2. Seleciona cliente.
3. Informa motivo.
4. Frontend chama `PATCH /api/clientes/{id}/bloqueio`.
5. Backend grava `bloqueado` e `motivo_bloqueio`.
6. Reservas e retiradas futuras chamam `garantirClienteSemPendencia`.
7. Cliente bloqueado recebe erro ao tentar reservar/retirar.

### Controle de extravio

1. ADM acessa emprestimos atrasados.
2. Seleciona emprestimo.
3. Informa observacao de extravio.
4. Frontend chama `PATCH /api/emprestimos/{id}/extraviar`.
5. Backend muda status para `EXTRAVIADO`.
6. Backend reduz `livros.quantidade_total`.
7. Backend bloqueia cliente.
8. Se houver devolucao posterior, `registrarDevolucao` restaura o total.

### Notificacoes administrativas

1. Erro acontece em retirada/devolucao ou dashboard calcula risco.
2. Frontend registra falha em `localStorage`.
3. Botao `Notificacoes` atualiza contador.
4. ADM abre gaveta.
5. Sistema mostra falha, contexto, data/hora e detalhes.

### Historico do usuario

1. Usuario logado acessa `meu-historico.html`.
2. Frontend busca reservas e emprestimos.
3. Sistema combina informacoes e mostra movimentacoes.
4. Usuario acompanha situacao sem depender do ADM.

### Dashboard administrativo

1. ADM acessa `adm.html`.
2. Frontend carrega dashboard, livros, usuarios, reservas, emprestimos e devolucoes.
3. Backend retorna metricas basicas.
4. Frontend calcula rankings, riscos, categorias, alertas e atividades recentes.
5. ADM acompanha indicadores gerenciais.

### Sugestao de livros semelhantes

1. Usuario abre `livro.html?id=...`.
2. Frontend carrega livro e catalogo.
3. Algoritmo compara categoria, autor e palavras do titulo.
4. Apenas livros disponiveis aparecem.
5. Se o livro atual estiver indisponivel, sugestoes recebem destaque.

### Livros mais reservados

1. Usuario abre catalogo.
2. Frontend chama `GET /api/livros/mais-procurados`.
3. Backend soma reservas e emprestimos por livro.
4. Retorna os 6 mais procurados.
5. Frontend mostra em carrossel.

## E) Impactos na Modelagem

### Entidades adicionadas

- `Administrador`.
- `RecuperacaoSenha`.

### Atributos adicionados

- `usuarios.senha_hash`.
- `usuarios.bloqueado`.
- `usuarios.motivo_bloqueio`.
- `emprestimos.renovado`.
- `emprestimos.estado_livro`.
- `emprestimos.observacao_devolucao`.
- `emprestimos.historico_contato`.
- `administradores.nome`, `email`, `senha_hash`, `ativo`, `token_sessao`.
- `recuperacao_senha.codigo`, `expiracao`, `utilizado`, `tentativas`.

### Relacionamentos alterados/adicionados

- `recuperacao_senha.usuario_id` N:1 com `usuarios.id`.
- `devolucoes.emprestimo_id` 1:1 com `emprestimos.id`.
- `devolucoes.cliente_id` N:1 com `usuarios.id`.
- `devolucoes.livro_id` N:1 com `livros.id`.
- `emprestimos.reserva_id` vincula emprestimo a reserva que originou a retirada.

### Metodos adicionados ou relevantes

- `loginAdministrador`.
- `validarTokenAdministrador`.
- `listarLivrosMaisProcurados`.
- `alterarSenha`.
- `alterarBloqueioCliente`.
- `solicitarCodigoRecuperacao`.
- `verificarCodigoRecuperacao`.
- `recuperarSenha`.
- `confirmarRetirada`.
- `renovarEmprestimo`.
- `registrarContatoPendencia`.
- `marcarEmprestimoComoExtraviado`.
- `registrarDevolucao`.
- `buscarDashboard`.
- `validarCodigoRecuperacao`.
- `expirarReservasVencidas`.
- `quantidadeReservavel`.
- `garantirClienteSemPendencia`.

### Regras novas surgidas

As regras novas estao consolidadas na secao A, com destaque para token ADM, recuperacao segura, bloqueio por pendencia, extravio, renovacao unica, limite combinado e disponibilidade reservavel.

## F) O Que Deve Ser Adicionado a Documentacao Final

### Obrigatoria para a documentacao

- Recuperacao de senha por e-mail.
- Tabela e classe de administrador.
- Token de acesso administrativo.
- Protecao das rotas administrativas.
- Bloqueio/desativacao de cliente.
- Controle de extravio.
- Registro de contato de pendencia.
- Renovacao unica.
- Historico de devolucoes com estado fisico.
- Disponibilidade considerando reservas pendentes.
- Limite de 3 itens considerando reservas + emprestimos.
- Impedimento de reserva duplicada.
- Expiracao automatica de reservas.
- Impedimento de exclusao de livro com operacao ativa.
- Novas tabelas `administradores` e `recuperacao_senha`.
- Trigger de protecao contra exclusao manual de usuario.

### Recomendada para a documentacao

- Minha conta.
- Alteracao de senha logada.
- Meus emprestimos.
- Meu historico.
- Dashboard administrativo avancado.
- Notificacoes administrativas.
- Sugestao de livros semelhantes.
- Livros mais reservados/mais procurados.
- Carrossel e paginacao do catalogo.
- Filtros nas telas administrativas.
- Tratamento padronizado de erros.

### Apenas documentacao tecnica interna

- CORS.
- Scripts `.bat` e `.ps1`.
- Guias de instalacao.
- Dados de teste.
- Inicializador automatico de dados.
- Script de correcao de acentuacao.
- Estrutura de comentarios no codigo.

## Itens Que Devem Ser Atualizados na Documentacao Oficial

### Casos de Uso que precisam ser alterados

- Login do administrador: incluir tabela `administradores`, BCrypt e token.
- Reservar livro: incluir quantidade reservavel, limite combinado, bloqueio e duplicidade.
- Confirmar retirada: incluir validacao de token, bloqueio e estoque.
- Registrar devolucao: incluir estado fisico, observacao, devolucao unica e restauracao de extravio.
- Verificar atrasos: incluir contato de pendencia, bloqueio e extravio.
- Gerenciar clientes: incluir bloqueio/desativacao.
- Gerenciar livros: incluir validacao contra exclusao com operacao ativa.

### Casos de Uso que precisam ser adicionados

- Recuperar senha.
- Verificar codigo de recuperacao.
- Definir nova senha.
- Alterar senha logado.
- Consultar minha conta.
- Consultar meus emprestimos.
- Consultar meu historico.
- Renovar emprestimo.
- Registrar contato de pendencia.
- Marcar livro como extraviado.
- Receber notificacao administrativa.
- Consultar livros mais procurados.
- Visualizar sugestoes semelhantes.
- Filtrar registros administrativos.

### Fluxos que precisam ser alterados

- Fluxo de login administrativo.
- Fluxo de reserva de livro.
- Fluxo de confirmacao de retirada.
- Fluxo de devolucao.
- Fluxo de atraso.
- Fluxo de gerenciamento de usuarios.
- Fluxo de gerenciamento de livros.
- Fluxo de consulta ao catalogo.

### Fluxos que precisam ser adicionados

- Recuperacao de senha.
- Bloqueio/desbloqueio de cliente.
- Extravio e devolucao de extravio.
- Notificacoes administrativas.
- Historico do usuario.
- Dashboard avancado.
- Sugestoes semelhantes.
- Livros mais reservados.

### Regras de Negocio que precisam ser adicionadas

- Codigo temporario de recuperacao.
- E-mail nao revelado na recuperacao.
- Invalidacao de codigos antigos.
- Senha com BCrypt.
- Token obrigatorio para ADM.
- Cliente bloqueado nao reserva nem retira.
- Cliente com pendencia critica nao pode ser desbloqueado.
- Limite de 3 itens combinando reservas e emprestimos.
- Impedimento de reserva duplicada.
- Quantidade reservavel considerando reservas pendentes.
- Expiracao automatica de reservas.
- Renovacao unica.
- Contato apenas em atraso/extravio.
- Extravio reduz acervo e bloqueia cliente.
- Devolucao de extravio restaura acervo.
- Devolucao unica por emprestimo.
- Livro com operacao ativa nao pode ser excluido.
- Usuario com historico nao deve ser excluido manualmente.

### Classes que precisam ser atualizadas

- `Usuario`: adicionar `senhaHash`, `bloqueado`, `motivoBloqueio`.
- `Emprestimo`: adicionar `renovado`, `estadoLivro`, `observacaoDevolucao`, `historicoContato`.
- `Devolucao`: registrar relacao 1:1 com emprestimo, cliente, livro e estado.
- `LivroResponse`: incluir `quantidadeReservavel`.
- `TechbookService`: adicionar metodos e regras descritas.
- `UsuarioController`, `EmprestimoController`, `LivroController`, `AdministracaoController`: atualizar endpoints.

### Classes que precisam ser adicionadas na documentacao

- `Administrador`.
- `RecuperacaoSenha`.
- `EmailService`.
- `AdministradorRepository`.
- `RecuperacaoSenhaRepository`.
- `ApiExceptionHandler`.
- DTOs: `AdminLoginResponse`, `AlterarSenhaRequest`, `ClienteBloqueioRequest`, `ContatoPendenciaRequest`, `ExtravioRequest`, `RecuperarSenhaCodigoRequest`, `RecuperarSenhaCodigoResponse`, `RecuperarSenhaRequest`, `VerificarCodigoRecuperacaoRequest`.

### DER que precisa ser atualizado

- Adicionar tabela `administradores`.
- Adicionar tabela `recuperacao_senha`.
- Adicionar relacionamento `recuperacao_senha.usuario_id -> usuarios.id`.
- Confirmar relacionamento `devolucoes.emprestimo_id -> emprestimos.id`.
- Confirmar relacionamentos `devolucoes.cliente_id -> usuarios.id` e `devolucoes.livro_id -> livros.id`.
- Adicionar colunas novas em `usuarios` e `emprestimos`.
- Incluir trigger `trg_usuarios_bloqueia_delete_com_vinculo` como regra de integridade.

### MER que precisa ser atualizado

- Nova entidade Administrador.
- Nova entidade RecuperacaoSenha.
- Usuario passa a ter senha segura, bloqueio e motivo.
- Emprestimo passa a controlar renovacao, estado fisico, observacao e historico de contato.
- Devolucao passa a representar historico detalhado da devolucao.
- Livro passa a ter disponibilidade calculada a partir do estoque e reservas pendentes.

### Banco de Dados que precisa ser atualizado

- Criar `administradores`.
- Criar `recuperacao_senha`.
- Adicionar/garantir `usuarios.senha_hash`, `usuarios.bloqueado`, `usuarios.motivo_bloqueio`.
- Adicionar/garantir `emprestimos.renovado`, `emprestimos.estado_livro`, `emprestimos.observacao_devolucao`, `emprestimos.historico_contato`.
- Criar trigger `trg_usuarios_bloqueia_delete_com_vinculo`.
- Documentar indices `idx_recuperacao_senha_usuario`, `idx_recuperacao_senha_expiracao`, `idx_administradores_token`.

### Telas que precisam ser adicionadas na documentacao

- `recuperar-senha.html`.
- `minha-conta.html`.
- `meus-emprestimos.html`.
- `meu-historico.html`.
- `adm-login.html` atualizado para login com token.

### Telas que precisam ser atualizadas na documentacao

- `catalogo.html`: livros mais reservados, carrossel, paginacao e filtro.
- `livro.html`: sugestoes semelhantes, quantidade reservavel, bloqueio e limite.
- `minhas-reservas.html`: historico de reservas ativas e encerradas.
- `adm.html`: dashboard avancado e notificacoes.
- `adm-usuarios.html`: bloqueio/desativacao.
- `adm-emprestimo.html`: renovacao.
- `adm-atrasos.html`: contato e extravio.
- `adm-devolucao.html`: estado fisico, observacao e historico.
- `adm-livros.html`: filtros, estoque e protecao de exclusao.

