package org.example.customer_service.controllers;

import org.example.customer_service.entities.Appointment;
import org.example.customer_service.services.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointment));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomer(customerId));
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @PathVariable String status) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }
}
