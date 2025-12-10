package org.example.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import org.example.customer_service.dto.EmployeeSummaryDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private List<VehicleSummaryDto> vehicles;
    // Optional employee information (populated when requested by callers)
    private EmployeeSummaryDto employee;
}
