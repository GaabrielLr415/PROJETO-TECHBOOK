package com.techbook.repository;

import com.techbook.model.RecuperacaoSenha;
import com.techbook.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, Long> {

    List<RecuperacaoSenha> findByUsuarioAndUtilizadoFalse(Usuario usuario);

    Optional<RecuperacaoSenha> findTopByUsuarioAndUtilizadoFalseOrderByIdDesc(Usuario usuario);
}
