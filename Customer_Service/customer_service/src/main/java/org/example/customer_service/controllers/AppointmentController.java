package org.example.customer_service.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.services.AppointmentService;
import org.example.customer_service.services.AuthClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    private AuthClientService authClientService;

    private Long fetchCustomerIdFromAuth(String email) {
        return authClientService.getCustomerIdByEmail(email);
    }

    private Long getCustomerId(HttpServletRequest req) {
        Object id = req.getAttribute("customerId");
        return id == null ? null : (Long) id;
    }

    private String getEmail(HttpServletRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            return String.valueOf(auth.getPrincipal());
        }
        Object email = req.getAttribute("email");
        return email == null ? null : email.toString();
    }

    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody Appointment appointment, HttpServletRequest req) {
        String email = getEmail(req);
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized: Missing or invalid token");

        // TODO: call Auth service to get customerId using email
        Long customerId = fetchCustomerIdFromAuth(email);
        appointment.setCustomerId(customerId);

        Appointment saved = appointmentService.bookAppointment(appointment);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myAppointments(HttpServletRequest req) {
        Long customerId = getCustomerId(req);
        if (customerId == null) {
            String email = getEmail(req);
            if (email == null)
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");

            customerId = fetchCustomerIdFromAuth(email);
            if (customerId == null)
                return ResponseEntity.status(500).body("Unable to fetch customerId from auth service");
        }

        List<Appointment> list = appointmentService.getAppointmentsByCustomer(customerId);
        return ResponseEntity.ok(list);
    }


    @PutMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        return appointmentService.updateAppointmentStatus(id, status);
    }

    @GetMapping("/count")
    public Long getAppointmentCountByStatus(@RequestParam AppointmentStatus status) {
        return appointmentService.getAppointmentCountByStatus(status);
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable Long id) {
        boolean deleted = appointmentService.deleteAppointment(id);
        return deleted ? "Appointment deleted successfully" : "Appointment not found";
    }
}
