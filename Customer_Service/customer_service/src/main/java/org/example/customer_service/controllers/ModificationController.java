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

    @PostMapping("/request")
    public ResponseEntity<Modification> requestModification(@RequestBody Modification modification) {
        return ResponseEntity.ok(modificationService.requestModification(modification));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Modification>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(modificationService.getByCustomer(customerId));
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Modification> updateStatus(@PathVariable Long id, @PathVariable String status) {
        return ResponseEntity.ok(modificationService.updateStatus(id, status));
    }
}
