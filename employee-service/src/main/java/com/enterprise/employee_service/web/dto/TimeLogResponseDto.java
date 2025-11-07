package com.enterprise.employee_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TimeLogResponseDto {
    private Long id;
    private Long assignmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String note;
}
