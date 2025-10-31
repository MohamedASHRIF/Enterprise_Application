package com.enterprise.employee_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class ScheduleResponseDto {
    private Long id;
    private Long employeeId;
    private LocalDate date;
    private LocalTime shiftStart;
    private LocalTime shiftEnd;
}
