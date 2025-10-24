package org.example.customer_service.controllers;

import org.example.customer_service.entities.Modification;
import org.example.customer_service.services.ModificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modifications")
public class ModificationController {

    @Autowired
    private ModificationService modificationService;

    //Request modification for an existing appointment
    @PostMapping("/request/{appointmentId}")
    public ResponseEntity<Modification> requestModification(
            @PathVariable Long appointmentId,
            @RequestBody Modification modification) {
        return ResponseEntity.ok(modificationService.requestModification(appointmentId, modification));
    }

    //Admin updates modification status (APPROVED, IN_PROGRESS, COMPLETED)
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Modification> updateStatus(
            @PathVariable Long id,
            @PathVariable String status) {
        return ResponseEntity.ok(modificationService.updateModificationStatus(id, status));
    }

    //Get all modifications for a specific appointment
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Modification>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(modificationService.getModificationsByAppointment(appointmentId));
    }

    //Get all modifications for a customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Modification>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(modificationService.getByCustomer(customerId));
    }
}
