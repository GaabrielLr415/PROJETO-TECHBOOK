package com.techbook.repository;

import com.techbook.model.Administrador;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {

    Optional<Administrador> findByEmailIgnoreCase(String email);

    Optional<Administrador> findByTokenSessaoAndAtivoTrue(String tokenSessao);
}
