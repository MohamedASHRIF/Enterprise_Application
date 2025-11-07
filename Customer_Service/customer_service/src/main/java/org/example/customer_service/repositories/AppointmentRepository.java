package org.example.customer_service.repositories;

import org.example.customer_service.entities.Appointment;
import org.example.customer_service.models.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerId(Long customerId);

    List<Appointment> findByVehicleId(Long vehicleId);

    List<Appointment> findByStatus(AppointmentStatus status);

    Long countByStatus(AppointmentStatus status);

    Long countByCustomerId(Long customerId);

    // Find appointments on a specific date
    List<Appointment> findByAppointmentDate(java.time.LocalDate appointmentDate);
}
