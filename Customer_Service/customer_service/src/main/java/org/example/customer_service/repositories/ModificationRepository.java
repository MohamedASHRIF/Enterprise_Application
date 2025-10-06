package org.example.customer_service.repositories;

import org.example.customer_service.entities.Modification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModificationRepository extends JpaRepository<Modification, Long> {
    List<Modification> findByCustomerId(Long customerId);
}