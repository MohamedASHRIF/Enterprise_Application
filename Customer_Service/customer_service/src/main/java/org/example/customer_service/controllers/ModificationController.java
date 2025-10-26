package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Modification;
import org.example.customer_service.models.ModificationStatus;
import org.example.customer_service.services.ModificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modifications")
@RequiredArgsConstructor
public class ModificationController {

    private final ModificationService modificationService;

    @PostMapping("/request")
    public Modification requestModification(@RequestBody Modification modification) {
        return modificationService.requestModification(modification);
    }

    @GetMapping("/appointment/{appointmentId}")
    public List<Modification> getByAppointment(@PathVariable Long appointmentId) {
        return modificationService.getModificationsByAppointment(appointmentId);
    }

    @PutMapping("/{id}/status")
    public Modification updateStatus(@PathVariable Long id, @RequestParam ModificationStatus status) {
        return modificationService.updateModificationStatus(id, status);
    }
}
