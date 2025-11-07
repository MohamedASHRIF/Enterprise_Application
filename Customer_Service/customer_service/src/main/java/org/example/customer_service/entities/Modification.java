package org.example.customer_service.entities;

import org.example.customer_service.models.ModificationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "modifications")
public class Modification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



//    @Column(name = "vehicle_id", nullable = false)
//    private Long vehicleId;


    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;


    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    private ModificationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}