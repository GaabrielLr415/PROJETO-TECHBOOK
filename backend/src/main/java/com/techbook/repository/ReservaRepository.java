package com.techbook.repository;

import com.techbook.model.Reserva;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByClienteIdOrderByIdDesc(Long clienteId);

    long countByClienteIdAndStatus(Long clienteId, String status);

    long countByLivroIdAndStatus(Long livroId, String status);

    List<Reserva> findByStatusAndPrazoRetiradaBefore(String status, LocalDate data);
}
