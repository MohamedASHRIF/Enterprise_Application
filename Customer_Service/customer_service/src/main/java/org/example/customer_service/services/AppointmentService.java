package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.repositories.AppointmentRepository;
import org.example.customer_service.repositories.ServiceRepository;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;
    private final VehicleRepository vehicleRepository;
    private final ServiceRepository serviceRepository;

    @Value("${employee.service.url:http://localhost:8070}")
    private String employeeServiceUrl;

    /**
     * Save appointment to DB and then (best-effort) call employee-service to auto-assign.
     * This method does not require additional configuration files; it uses a simple RestTemplate
     * and posts a small JSON payload to the employee-service endpoint. Failures are logged
     * and do not prevent the appointment from being saved.
     */
    public Appointment bookAppointment(Appointment appointment) {
        // Resolve vehicle and service references from ids (client posts { vehicle: { id }, service: { id } })
        if (appointment.getVehicle() == null || appointment.getVehicle().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle.id is required in payload");
        }
        if (appointment.getService() == null || appointment.getService().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "service.id is required in payload");
        }

        Long vehicleId = appointment.getVehicle().getId();
        Long serviceId = appointment.getService().getId();

        appointment.setVehicle(vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found with id: " + vehicleId)));
        appointment.setService(serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service not found with id: " + serviceId)));

        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);

        // Best-effort auto-assign call (do not make booking fail if the call fails)
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("appointmentId", saved.getId());
            payload.put("serviceType", saved.getService() != null ? saved.getService().getName() : "");
            payload.put("appointmentDate", saved.getAppointmentDate() != null ? saved.getAppointmentDate().toString() : null);

            String url = employeeServiceUrl + "/api/assignments/auto-assign-by-request";
            restTemplate.postForEntity(url, payload, Void.class);
        } catch (Exception ex) {
            // log and continue
            log.warn("auto-assign call failed for appointment {}: {}", saved.getId(), ex.getMessage());
        }

        return saved;
    }

    public List<Appointment> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
    Appointment appointment = appointmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found with id: " + id));
        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }

    public Long getAppointmentCountByStatus(AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public boolean deleteAppointment(Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
