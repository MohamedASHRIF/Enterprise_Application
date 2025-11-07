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
import java.net.UnknownHostException;
import org.springframework.web.client.ResourceAccessException;

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
    @Value("${admin.service.url:http://localhost:8082}")
    private String adminServiceUrl;

    /**
     * Save appointment to DB and then (best-effort) call employee-service to
     * auto-assign.
     * This method does not require additional configuration files; it uses a simple
     * RestTemplate
     * and posts a small JSON payload to the employee-service endpoint. Failures are
     * logged
     * and do not prevent the appointment from being saved.
     */
    public Appointment bookAppointment(Appointment appointment) {
        // DEBUG: log incoming payload fields to help diagnose unexpected 403 responses
        try {
            // Use INFO so the message appears in default log level
            log.info(
                    "bookAppointment: incoming payload: customerId={} vehicleId={} serviceId={} appointmentDate={} appointmentTime={}",
                    appointment != null ? appointment.getCustomerId() : null,
                    appointment != null && appointment.getVehicle() != null ? appointment.getVehicle().getId() : null,
                    appointment != null && appointment.getService() != null ? appointment.getService().getId() : null,
                    appointment != null ? appointment.getAppointmentDate() : null,
                    appointment != null ? appointment.getAppointmentTime() : null);
        } catch (Exception e) {
            log.warn("bookAppointment: failed to log incoming payload: {}", e.toString());
        }
        // Resolve vehicle and service references from ids (client posts { vehicle: { id
        // }, service: { id } })
        if (appointment.getVehicle() == null || appointment.getVehicle().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle.id is required in payload");
        }
        if (appointment.getService() == null || appointment.getService().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "service.id is required in payload");
        }

        Long vehicleId = appointment.getVehicle().getId();
        Long serviceId = appointment.getService().getId();

        appointment.setVehicle(vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Vehicle not found with id: " + vehicleId)));
        // Try to resolve service locally; if not present, attempt to fetch from Admin
        // service and seed locally
        appointment.setService(serviceRepository.findById(serviceId).orElseGet(() -> {
            log.warn("Service id {} not found locally; attempting to fetch from admin service {}", serviceId,
                    adminServiceUrl);
            try {
                // admin exposes GET /api/services which returns array; fetch and search for
                // matching id
                Object[] arr = restTemplate.getForObject(adminServiceUrl + "/api/services", Object[].class);
                if (arr != null) {
                    for (Object o : arr) {
                        try {
                            @SuppressWarnings("unchecked")
                            var m = (java.util.Map<String, Object>) o;
                            Number idNum = (Number) (m.get("id"));
                            if (idNum != null && idNum.longValue() == serviceId.longValue()) {
                                // map admin service fields to local Service entity
                                org.example.customer_service.entities.Service s = new org.example.customer_service.entities.Service();
                                s.setName((String) m.getOrDefault("name", ""));
                                s.setDescription((String) m.getOrDefault("description", ""));
                                // admin may use estimateMins or estimate_mins
                                Object em = m.getOrDefault("estimateMins", m.get("estimate_mins"));
                                int duration = 0;
                                if (em instanceof Number)
                                    duration = ((Number) em).intValue();
                                else if (em instanceof String)
                                    duration = Integer.parseInt((String) em);
                                s.setDuration(duration);
                                // cost/price mapping
                                Object costObj = m.getOrDefault("cost", m.get("price"));
                                double price = 0.0;
                                if (costObj instanceof Number)
                                    price = ((Number) costObj).doubleValue();
                                else if (costObj instanceof String)
                                    price = Double.parseDouble((String) costObj);
                                s.setPrice(price);
                                s.setCategory((String) m.getOrDefault("category", ""));
                                Object ratingObj = m.get("rating");
                                if (ratingObj instanceof Number)
                                    s.setRating(((Number) ratingObj).doubleValue());
                                else if (ratingObj instanceof String)
                                    s.setRating(Double.parseDouble((String) ratingObj));
                                // Persist locally so future bookings can reference
                                org.example.customer_service.entities.Service saved = serviceRepository.save(s);
                                log.info("Seeded local service from admin: id={} name={}", saved.getId(),
                                        saved.getName());
                                return saved;
                            }
                        } catch (Exception ex) {
                            log.warn("Error parsing admin service entry: {}", ex.toString());
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to fetch services from admin at {}: {}", adminServiceUrl, ex.toString());
            }
            // if not found, throw error as before
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service not found with id: " + serviceId);
        }));

        // DEBUG: confirm resolved entities
        try {
            log.info("bookAppointment: resolved vehicle={}", appointment.getVehicle());
            log.info("bookAppointment: resolved service={}", appointment.getService());
        } catch (Exception e) {
            log.warn("bookAppointment: failed to log resolved entities: {}", e.toString());
        }

        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        log.info("bookAppointment: saving appointment for customerId={} serviceId={} vehicleId={}",
                appointment.getCustomerId(), appointment.getService() != null ? appointment.getService().getId() : null,
                appointment.getVehicle() != null ? appointment.getVehicle().getId() : null);
        Appointment saved;
        try {
            saved = appointmentRepository.save(appointment);
            log.info("bookAppointment: appointment saved with id={}", saved != null ? saved.getId() : null);
        } catch (Exception ex) {
            // Log full stacktrace so we can see why saving (or anything before return)
            // fails
            log.error("bookAppointment: exception while saving appointment: {}", ex.toString(), ex);
            throw ex;
        }

        // Best-effort auto-assign call (do not make booking fail if the call fails)
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("appointmentId", saved.getId());
            payload.put("serviceType", saved.getService() != null ? saved.getService().getName() : "");
            payload.put("appointmentDate",
                    saved.getAppointmentDate() != null ? saved.getAppointmentDate().toString() : null);

            String url = employeeServiceUrl + "/api/assignments/auto-assign-by-request";
            // Log before calling so we can see where the request is sent from runtime logs
            log.info("Calling employee-service auto-assign at url={} with payload={}", url, payload);

            var response = restTemplate.postForEntity(url, payload, Void.class);
            log.info("employee-service auto-assign response for appointment {}: status={}", saved.getId(),
                    response != null ? response.getStatusCode() : "null-response");
        } catch (ResourceAccessException rae) {
            // Common case: UnknownHostException when running locally but config uses Docker
            // hostnames like 'employee'
            Throwable cause = rae.getCause();
            if (cause instanceof UnknownHostException
                    || (cause != null && String.valueOf(cause.getMessage()).contains("employee"))) {
                String fallback = "http://localhost:8070/api/assignments/auto-assign-by-request";
                log.warn("auto-assign primary host unreachable ({}). Retrying with fallback {}", rae.getMessage(),
                        fallback);
                try {
                    var r2 = restTemplate.postForEntity(fallback, Map.of(
                            "appointmentId", saved.getId(),
                            "serviceType", saved.getService() != null ? saved.getService().getName() : "",
                            "appointmentDate",
                            saved.getAppointmentDate() != null ? saved.getAppointmentDate().toString() : null),
                            Void.class);
                    log.info("employee-service fallback auto-assign response for appointment {}: status={}",
                            saved.getId(), r2 != null ? r2.getStatusCode() : "null-response");
                } catch (Exception ex2) {
                    log.error("fallback auto-assign also failed for appointment {}: {}", saved.getId(), ex2.toString(),
                            ex2);
                }
            } else {
                log.error("auto-assign call failed for appointment {}: {}", saved.getId(), rae.toString(), rae);
            }
        } catch (Exception ex) {
            // log full stacktrace and message so other connectivity/parsing errors are
            // visible in logs
            log.error("auto-assign call failed for appointment {}: {}", saved.getId(), ex.toString(), ex);
        }

        return saved;
    }

    public List<Appointment> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Appointment not found with id: " + id));
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
