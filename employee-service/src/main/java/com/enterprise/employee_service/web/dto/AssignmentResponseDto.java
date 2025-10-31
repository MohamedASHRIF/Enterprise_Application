package com.enterprise.employee_service.web.dto;

import com.enterprise.employee_service.domain.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AssignmentResponseDto {
    private Long id;
    private Long employeeId;
    private Long appointmentId;
    private AssignmentStatus status;
}
