package com.enterprise.employee_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkHoursResponseDto {
    private Long id;
    private Long employeeId;
    private LocalDate workDate;
    private Long totalSeconds;
    private Integer logCount;
    
    // Helper method to get hours as double
    public double getHours() {
        return totalSeconds != null ? totalSeconds / 3600.0 : 0.0;
    }
    
    // Helper method to format as "Xh Ym"
    public String getFormattedHours() {
        if (totalSeconds == null || totalSeconds == 0) return "0h";
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        if (minutes > 0) {
            return hours + "h " + minutes + "m";
        }
        return hours + "h";
    }
}

