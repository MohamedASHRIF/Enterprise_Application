package com.enterprise.employee_service.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to employee from Auth Service
    private Long employeeId;

    private LocalDate date;
    private LocalTime shiftStart;
    private LocalTime shiftEnd;
}
