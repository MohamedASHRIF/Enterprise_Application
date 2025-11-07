package com.enterprise.employee_service.web.dto;

import com.enterprise.employee_service.domain.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponseDto {
    private Long id;
    private Long employeeId;
    private Long appointmentId;
    private AssignmentStatus status;

    // Enriched fields
    private String customerFirstName;
    private String customerLastName;
    private String customerName;
    private String vehicle; // e.g. "Toyota Corolla 2018"
    private String service; // service name
    private String appointmentDate;
    private String appointmentTime;
    private String estimatedDuration;

    // Keep a constructor matching previous usage
    public AssignmentResponseDto(Long id, Long employeeId, Long appointmentId, AssignmentStatus status) {
        this.id = id;
        this.employeeId = employeeId;
        this.appointmentId = appointmentId;
        this.status = status;
    }
}
