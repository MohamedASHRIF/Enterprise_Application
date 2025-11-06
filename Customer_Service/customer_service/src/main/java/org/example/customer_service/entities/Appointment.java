package org.example.customer_service.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.example.customer_service.models.AppointmentStatus;

import java.time.LocalDate;
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
    
    private long customerId;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnoreProperties("appointments") // Prevent circular reference
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnoreProperties("appointments") // Prevent circular reference
    private Service service;

    // Employee assignment is now owned by employee-service (BFF).
    // We no longer store a JPA relation to Employee here to avoid duplicated responsibility.

    private LocalDate appointmentDate;
    private String appointmentTime;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @ElementCollection
    @CollectionTable(name = "appointment_notes", joinColumns = @JoinColumn(name = "appointment_id"))
    @Column(name = "note")
    private List<String> notes = new ArrayList<>();

    @Column(nullable = true)
    private String feedback;

    private String estimatedDuration;
    private Long actualDuration;
    private Double totalCost;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
