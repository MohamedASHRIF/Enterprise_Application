package org.example.customer_service.repositories;

import org.example.customer_service.entities.Modification;
import org.example.customer_service.entities.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
//    List<Service> findByAppointmentId(Long appointmentId);

}