package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Modification;
import org.example.customer_service.models.ModificationStatus;
import org.example.customer_service.repositories.ModificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModificationService {

    private final ModificationRepository modificationRepository;

    public Modification requestModification(Modification modification) {
        modification.setStatus(ModificationStatus.REQUESTED);
        modification.setCreatedAt(LocalDateTime.now());
        modification.setUpdatedAt(LocalDateTime.now());
        return modificationRepository.save(modification);
    }

    public List<Modification> getModificationsByAppointment(Long appointmentId) {
        return modificationRepository.findByAppointmentId(appointmentId);
    }

    public Modification updateModificationStatus(Long id, ModificationStatus status) {
        Modification modification = modificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modification not found"));
        modification.setStatus(status);
        modification.setUpdatedAt(LocalDateTime.now());
        return modificationRepository.save(modification);
    }
}