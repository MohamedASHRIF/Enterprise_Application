package com.enterprise.employee_service.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "daily_work_hours", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "work_date"}))
public class DailyWorkHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private LocalDate workDate;

    @Column(nullable = false)
    private Long totalSeconds; // Total work time in seconds for the day

    @Column(nullable = false)
    private Integer logCount; // Number of time log entries for the day

    @PrePersist
    void onCreate() {
        if (totalSeconds == null) totalSeconds = 0L;
        if (logCount == null) logCount = 0;
    }
}

