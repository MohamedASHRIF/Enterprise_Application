package org.example.customer_service.entities;

import jakarta.persistence.*;
import lombok.*;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.models.ServiceType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    @Column(columnDefinition = "TEXT")
    private String customServiceDescription;

    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;


    @OneToMany(mappedBy = "appointmentId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Modification> modifications = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
