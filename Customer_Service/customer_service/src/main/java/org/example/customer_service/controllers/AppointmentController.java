package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.services.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        return appointmentService.bookAppointment(appointment);
    }

    @GetMapping("/customer/{customerId}")
    public List<Appointment> getAppointmentsByCustomer(@PathVariable Long customerId) {
        return appointmentService.getAppointmentsByCustomer(customerId);
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
