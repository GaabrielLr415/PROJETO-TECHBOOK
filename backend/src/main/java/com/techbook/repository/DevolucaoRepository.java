package com.techbook.repository;

import com.techbook.model.Devolucao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DevolucaoRepository extends JpaRepository<Devolucao, Long> {

    Optional<Devolucao> findByEmprestimoId(Long emprestimoId);

    List<Devolucao> findByClienteIdOrderByIdDesc(Long clienteId);
}
