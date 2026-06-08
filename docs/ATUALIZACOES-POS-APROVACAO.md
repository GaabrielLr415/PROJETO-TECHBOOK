# Atualizacoes Pos-Aprovacao - TechBook

Depois da aprovacao da documentacao principal, o projeto TechBook passou por melhorias complementares para tornar o sistema mais completo, organizado e seguro. Essas alteracoes nao substituem o que ja havia sido aprovado; elas ampliam a solucao e deixam o projeto mais proximo de um sistema real de biblioteca.

As melhorias foram feitas para melhorar a experiencia do usuario, facilitar o trabalho do administrador e proteger melhor as informacoes registradas no banco de dados.

## Justificativa Geral

O TechBook ja atendia ao fluxo principal de cadastro, reserva, emprestimo, devolucao e controle administrativo. Durante a revisao final, foram identificadas oportunidades de aprimorar a navegacao, a organizacao do catalogo, a seguranca dos dados e a manutencao do projeto pela equipe.

Por esse motivo, foram adicionadas funcionalidades que complementam o escopo original sem alterar a proposta aprovada.

## Melhorias Realizadas

### Sugestoes de livros semelhantes

Foi adicionada uma area de sugestoes na pagina de detalhes do livro. Essa melhoria foi feita para ajudar o usuario a encontrar novas leituras relacionadas ao livro que ele esta visualizando.

O sistema sugere livros da mesma categoria ou do mesmo autor, mostrando apenas obras disponiveis para reserva. Com isso, o catalogo fica mais util e incentiva o usuario a continuar explorando o acervo.

Arquivos relacionados:

- `frontend/livro.html`
- `frontend/js/catalogo.js`
- `frontend/css/catalogo.css`

### Livros mais reservados

Foi criada a secao `Mais reservados` no catalogo. Como o TechBook e um sistema de biblioteca, a ideia nao e destacar livros vendidos, mas sim livros com maior procura pelos usuarios.

Essa melhoria ajuda o usuario a perceber quais titulos estao sendo mais buscados ou reservados, criando uma experiencia mais parecida com plataformas modernas de catalogo.

Arquivos relacionados:

- `frontend/catalogo.html`
- `frontend/js/catalogo.js`
- `frontend/css/catalogo.css`

### Carrossel interativo

A secao de livros mais reservados foi organizada em formato de carrossel. Essa decisao foi tomada para mostrar os livros em destaque sem ocupar muito espaco da pagina.

O usuario pode navegar pelas setas, pelas bolinhas de indicacao ou arrastando com o mouse. Isso melhora a navegacao e deixa a tela mais dinamica.

Arquivo relacionado:

- `frontend/js/catalogo.js`

### Catalogo com 15 livros por pagina

O catalogo passou a exibir 15 livros por pagina. Essa melhoria foi feita para equilibrar quantidade de informacao e organizacao visual.

Com essa quantidade, o usuario consegue visualizar mais livros sem que a pagina fique excessivamente longa ou confusa.

Arquivo relacionado:

- `frontend/js/catalogo.js`

### Capas de livros sem corte

Foi ajustada a exibicao das capas dos livros para evitar cortes nas imagens. Antes, algumas capas poderiam ficar esticadas, cortadas ou quebradas visualmente.

Com o ajuste, a capa aparece inteira dentro do card, mesmo quando a imagem possui tamanho ou proporcao diferente.

Arquivo relacionado:

- `frontend/css/catalogo.css`

### Atualizacao do banco de dados

O banco de dados foi atualizado com registros da copia mais completa do projeto. Essa melhoria foi feita para garantir que o catalogo tivesse mais livros cadastrados e dados suficientes para testar reservas, emprestimos, devolucoes e historico.

Arquivo relacionado:

- `database/techbook.sql`

### Comentarios de organizacao no codigo

Foram adicionados comentarios curtos nos arquivos HTML, CSS, JavaScript e Java. Esses comentarios identificam partes importantes do sistema, como cabecalho, rodape, formulario, tabela, catalogo, painel administrativo, livros mais reservados e sugestoes semelhantes.

Essa melhoria nao altera o funcionamento do sistema. Ela foi feita para facilitar a manutencao pela equipe e tornar o projeto mais compreensivel para quem precisar revisar ou apresentar o codigo.

### Guia de controle do projeto

Foi criado um guia de controle para reunir a estrutura do projeto em um unico lugar. O objetivo e facilitar a localizacao dos arquivos e explicar a funcao das principais partes do sistema.

Arquivo relacionado:

- `GUIA-DE-CONTROLE-DO-PROJETO.md`

### Bloqueio ou desativacao de cliente

Foi adicionada a opcao de bloquear ou desativar clientes pelo painel administrativo. Essa melhoria foi escolhida em vez da exclusao direta de usuarios, porque um cliente pode ter historico de reservas, emprestimos, devolucoes, atrasos ou extravios.

Ao bloquear um cliente, o historico permanece preservado e o sistema impede novas reservas enquanto houver uma pendencia ou decisao administrativa. Isso protege a integridade dos registros da biblioteca.

Arquivos relacionados:

- `frontend/adm-usuarios.html`
- `frontend/js/adm.js`
- `backend/src/main/java/com/techbook/controller/UsuarioController.java`
- `backend/src/main/java/com/techbook/service/TechbookService.java`

### Protecao contra exclusao direta no banco

Foi adicionada uma protecao no banco de dados para impedir que um usuario com reservas, emprestimos ou devolucoes vinculadas seja excluido manualmente.

Essa melhoria evita que o historico do sistema seja quebrado. Caso alguem tente apagar um usuario com registros vinculados, o banco apresenta uma mensagem orientando o uso do bloqueio/desativacao pelo painel administrativo.

Arquivos relacionados:

- `database/techbook.sql`
- `database/proteger-exclusao-usuarios.sql`

### CSS reserva

Alguns arquivos CSS antigos foram mantidos no projeto como reserva. Eles nao estao ligados as telas atuais, mas foram preservados para evitar perda de informacao visual que possa ser consultada no futuro.

Arquivos relacionados:

- `frontend/css/styles.css`
- `frontend/css/minha-conta.css`

## Conclusao

As melhorias adicionadas reforcam a proposta do TechBook como um sistema de biblioteca mais organizado, seguro e facil de usar. Elas complementam a documentacao aprovada, melhorando a experiencia do usuario, o controle administrativo e a preservacao dos dados do sistema.
