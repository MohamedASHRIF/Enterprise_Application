package org.example.customer_service.repositories;

import org.example.customer_service.entities.Modification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModificationRepository extends JpaRepository<Modification, Long> {
    List<Modification> findByAppointmentId(Long appointmentId);
}
