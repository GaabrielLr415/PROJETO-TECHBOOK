# Documento de Uso e Viabilidade - TECHBOOK

## 1. Objetivo do documento

Este documento apresenta como a plataforma TECHBOOK deve ser utilizada pelo cliente e pelo administrador, explicando o fluxo completo de uso do sistema. Tambem demonstra a viabilidade do projeto como solucao para consulta, reserva, emprestimo, devolucao e controle de livros em uma biblioteca.

O objetivo e mostrar que o sistema possui um fluxo organizado, facil de entender e adequado para o controle basico de um acervo digital.

## 2. Viabilidade do sistema

O TECHBOOK e viavel porque atende a uma necessidade comum em bibliotecas: organizar o acesso aos livros e controlar as movimentacoes do acervo. Com ele, o usuario consegue consultar livros, fazer reservas e acompanhar sua situacao. O administrador consegue controlar reservas, retiradas, emprestimos, devolucoes, atrasos, extravios, estoque e clientes.

O sistema tambem evita processos totalmente manuais, como anotar reservas em papel ou controlar devolucoes sem historico. Dessa forma, a plataforma reduz erros, melhora a organizacao e facilita a tomada de decisao do administrador.

## 3. Publico-alvo

O sistema foi pensado para dois tipos principais de usuarios:

- Cliente: pessoa que consulta o catalogo, cria conta, reserva livros e acompanha seus emprestimos.
- Administrador: pessoa responsavel por gerenciar o acervo, confirmar retiradas, registrar devolucoes e acompanhar pendencias.

## 4. Uso da plataforma pelo cliente

### 4.1 Acessar o site

O cliente inicia o uso acessando a pagina principal do TECHBOOK. A partir dela, pode navegar pelas informacoes do site e acessar o catalogo de livros.

Resultado esperado: o cliente consegue conhecer a plataforma e entrar na area de consulta de livros.

### 4.2 Consultar o catalogo

No catalogo, o cliente visualiza os livros cadastrados no sistema. A tela apresenta os titulos disponiveis, informacoes basicas e a opcao de ver mais detalhes.

O catalogo tambem possui organizacao por paginas, exibindo quantidade limitada de livros por vez para manter a navegacao mais clara.

Resultado esperado: o cliente consegue encontrar livros de interesse sem precisar consultar o administrador.

### 4.3 Usar a busca

O cliente pode pesquisar livros pelo campo de busca do catalogo. Essa busca ajuda a localizar rapidamente um titulo, autor ou categoria.

Resultado esperado: o cliente encontra livros com mais facilidade.

### 4.4 Ver detalhes do livro

Ao selecionar um livro, o cliente acessa a pagina de detalhes. Nessa tela, pode visualizar informacoes como titulo, autor, categoria, descricao, disponibilidade e imagem da capa.

Quando houver livros relacionados, o sistema tambem pode exibir sugestoes semelhantes com base no autor ou na categoria.

Resultado esperado: o cliente entende melhor o livro antes de reservar.

### 4.5 Criar cadastro

Para reservar um livro, o cliente precisa ter cadastro no sistema. No cadastro, informa dados como nome, CPF, e-mail, telefone e senha.

Resultado esperado: o cliente passa a ter uma conta para acessar suas reservas, emprestimos e historico.

### 4.6 Fazer login

Depois de cadastrado, o cliente acessa sua conta usando e-mail e senha. O login libera as funcoes da area do cliente.

Resultado esperado: o sistema identifica o cliente e permite que ele realize reservas.

### 4.7 Reservar um livro

Na pagina do livro, o cliente pode clicar em reservar quando houver exemplar disponivel. A reserva fica vinculada ao usuario e passa a ter prazo de retirada.

Regra aplicada: a reserva fica pendente por 1 dia. Se o cliente nao retirar o livro dentro do prazo, a reserva pode expirar.

Resultado esperado: o livro fica reservado para o cliente ate a confirmacao da retirada pelo administrador.

### 4.8 Acompanhar minhas reservas

Na tela Minhas Reservas, o cliente visualiza as reservas realizadas e seus respectivos status. A reserva pode aparecer como pendente, confirmada, cancelada ou expirada, dependendo da situacao.

Resultado esperado: o cliente sabe quais livros reservou e acompanha o prazo de retirada.

### 4.9 Acompanhar meus emprestimos

Depois que o administrador confirma a retirada, a reserva se transforma em emprestimo. O cliente pode acompanhar os livros emprestados na tela Meus Emprestimos.

Regra aplicada: o emprestimo tem prazo de 14 dias. O sistema tambem permite renovacao quando a regra permitir.

Resultado esperado: o cliente acompanha a data prevista de devolucao e evita atrasos.

### 4.10 Ver meu historico

Na tela Meu Historico, o cliente pode consultar movimentacoes relacionadas a reservas, emprestimos e devolucoes.

Resultado esperado: o cliente tem transparencia sobre suas acoes dentro do sistema.

### 4.11 Usar a area Minha Conta

Na area Minha Conta, o cliente pode visualizar seus dados e acessar opcoes relacionadas a conta.

Resultado esperado: o cliente tem uma area propria dentro da plataforma.

## 5. Uso da plataforma pelo administrador

### 5.1 Acessar o login administrativo

O administrador acessa a tela de login administrativo e informa suas credenciais.

Credenciais do projeto:

- E-mail: admin@techbook.local
- Senha: 123456

Resultado esperado: o administrador entra no painel de controle.

### 5.2 Acompanhar o dashboard

Depois do login, o administrador visualiza o dashboard. Essa tela centraliza indicadores do acervo, como livros cadastrados, emprestimos ativos, atrasos, clientes, movimentacoes recentes, livros mais procurados e categorias com maior interesse.

O dashboard tambem possui uma aba lateral de notificacoes para alertas administrativos e risco de falta.

Resultado esperado: o administrador entende rapidamente a situacao geral da biblioteca.

### 5.3 Confirmar retirada de reserva

Na tela Confirmar Retirada, o administrador visualiza reservas pendentes. Quando o cliente comparece para retirar o livro, o administrador confirma a retirada.

Ao confirmar, a reserva deixa de ser apenas uma reserva e passa a ser um emprestimo ativo.

Resultado esperado: o sistema registra oficialmente que o livro foi retirado pelo cliente.

### 5.4 Acompanhar emprestimos ativos

Na tela Emprestimos Ativos, o administrador acompanha os livros que estao emprestados. A tela permite visualizar cliente, livro, datas e status.

Resultado esperado: o administrador sabe quais livros estao fora do acervo no momento.

### 5.5 Renovar emprestimo

Quando permitido, o administrador pode renovar um emprestimo. A renovacao adiciona mais dias ao prazo de devolucao.

Regra aplicada: a renovacao adiciona 7 dias e ocorre conforme as regras do sistema.

Resultado esperado: o cliente ganha novo prazo e o sistema atualiza a data prevista de devolucao.

### 5.6 Registrar devolucao

Na tela Registrar Devolucao, o administrador seleciona o emprestimo e informa a devolucao do livro. Tambem pode registrar o estado fisico do exemplar, como bom estado ou avariado, e incluir observacoes.

Resultado esperado: o livro volta ao acervo e o historico de devolucao fica registrado.

### 5.7 Consultar historico de devolucoes

Ainda na area de devolucoes, o administrador pode consultar devolucoes registradas, filtrar por estado do livro, mes e ano.

Resultado esperado: o administrador consegue acompanhar devolucoes ja realizadas.

### 5.8 Acompanhar emprestimos atrasados

Na tela Emprestimos Atrasados, o administrador visualiza emprestimos que passaram do prazo de devolucao. Essa tela ajuda a identificar pendencias e agir rapidamente.

Resultado esperado: o administrador sabe quais clientes precisam regularizar devolucoes.

### 5.9 Registrar contato em caso de atraso

Quando um emprestimo esta atrasado, o administrador pode registrar uma tentativa de contato com o cliente, informando canal utilizado e observacao.

Resultado esperado: o sistema guarda o registro de acompanhamento da pendencia.

### 5.10 Marcar extravio

Se um livro nao for devolvido ou for considerado perdido, o administrador pode marcar o exemplar como extraviado. Essa acao registra a situacao, ajusta o acervo e pode bloquear o cliente para novas reservas e retiradas.

Resultado esperado: o sistema identifica a perda do exemplar e evita que o acervo fique com dados incorretos.

### 5.11 Gerenciar livros e estoque

Na tela Livros e Estoque, o administrador pode consultar livros cadastrados, editar informacoes, ajustar quantidade total e quantidade disponivel, cadastrar novos livros e excluir livros quando permitido.

Resultado esperado: o acervo permanece atualizado.

### 5.12 Gerenciar clientes

Na tela Clientes, o administrador visualiza usuarios cadastrados e sua situacao. A tabela mostra se o cliente esta liberado ou bloqueado.

Ao clicar em Gerenciar, o administrador pode consultar a situacao do cliente e bloquear ou desbloquear quando necessario. O bloqueio preserva o historico do usuario e impede novas acoes enquanto houver pendencia ou decisao administrativa.

Resultado esperado: o administrador controla clientes sem apagar informacoes importantes.

### 5.13 Consultar historico do cliente no ADM

Na tela Clientes, o botao Historico permite abrir as movimentacoes vinculadas a um usuario, como reservas, emprestimos e devolucoes.

Resultado esperado: o administrador consegue analisar a relacao do cliente com a biblioteca.

## 6. Regras principais do sistema

- A reserva dura 1 dia.
- O emprestimo dura 14 dias.
- A renovacao adiciona 7 dias quando permitida.
- O cliente pode ter ate 3 livros entre reservas pendentes e emprestimos ativos.
- Reservas vencidas podem expirar automaticamente.
- Emprestimos atrasados aparecem para acompanhamento administrativo.
- Extravios reduzem o acervo fisico e podem bloquear o cliente.
- Devolucoes restauram a disponibilidade do livro quando aplicavel.
- Clientes com pendencias podem ser bloqueados para novas reservas e retiradas.

## 7. Beneficios do sistema

O TECHBOOK oferece beneficios para o cliente e para a administracao da biblioteca:

- facilita a consulta de livros;
- organiza reservas e emprestimos;
- reduz controle manual;
- melhora o acompanhamento de atrasos;
- preserva historico de movimentacoes;
- ajuda no controle do estoque;
- melhora a experiencia do usuario;
- oferece uma visao administrativa mais clara.

## 8. Limites e melhorias futuras

O TECHBOOK atende ao fluxo principal de uma biblioteca academica ou de pequeno porte. Para uso em larga escala, o sistema pode evoluir com melhorias como:

- cadastro de varios administradores;
- niveis de permissao por tipo de usuario;
- auditoria completa de acoes administrativas;
- backup automatico do banco de dados;
- relatorios mensais e anuais;
- notificacoes por e-mail ou WhatsApp;
- maior controle formal de privacidade e consentimento.

Essas melhorias nao impedem o uso atual do sistema, mas representam possibilidades de evolucao para uma implantacao real.

## 9. Conclusao

O TECHBOOK se mostra viavel porque organiza o processo de consulta, reserva, emprestimo e devolucao de livros de forma simples e funcional. O sistema tambem oferece recursos administrativos importantes, como dashboard, controle de atrasos, extravios, estoque, clientes e historico.

Dessa forma, a plataforma cumpre sua proposta de apoiar a gestao de uma biblioteca e melhorar a experiencia dos usuarios no acesso ao acervo.
