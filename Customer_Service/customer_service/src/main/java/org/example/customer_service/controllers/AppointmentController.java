package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.services.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.services.CustomerService;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        return appointmentService.bookAppointment(appointment);
    }

    @Deprecated
    @GetMapping("/customer/{customerId}")
    public List<Appointment> getAppointmentsByCustomer(@PathVariable Long customerId) {
        // Deprecated: kept for backward compatibility. New callers should use /user/{userId} or /me.
        // This endpoint attempts to find appointments where user_id equals the supplied id
        return appointmentService.getAppointmentsByUserId(customerId);
    }

    /**
     * Return appointments for the currently authenticated user.
     * This endpoint reads the application user id from the security Principal and
     * resolves the linked Customer record (via userId) to fetch appointments.
     */
    @GetMapping("/me")
    public List<Appointment> getMyAppointments(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new RuntimeException("Unauthenticated");
        }
        Long userId;
        try {
            userId = Long.parseLong(principal.getName());
        } catch (NumberFormatException nfe) {
            throw new RuntimeException("Unexpected principal name format; expected numeric user id");
        }

        return appointmentService.getAppointmentsByUserId(userId);
    }

    /**
     * Return appointments for a given application user id. This is a convenience
     * endpoint for other services which have the application user id available
     * and do not want to resolve the Customer.id themselves.
     */
    @GetMapping("/user/{userId}")
    public List<Appointment> getAppointmentsByUserId(@PathVariable Long userId) {
        return appointmentService.getAppointmentsByUserId(userId);
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
        if (deleted) {
            return "Appointment deleted successfully with ID: " + id;
        } else {
            return "Appointment not found with ID: " + id;
        }
    }
}
