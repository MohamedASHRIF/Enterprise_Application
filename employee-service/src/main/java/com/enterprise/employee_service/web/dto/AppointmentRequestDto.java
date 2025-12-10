package com.enterprise.employee_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AppointmentRequestDto {
    private Long appointmentId;
    private String serviceType;
    private LocalDate appointmentDate;
}
