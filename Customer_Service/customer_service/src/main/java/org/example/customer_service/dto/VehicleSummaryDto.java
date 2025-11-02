package org.example.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSummaryDto {
    private Long id;
    private String make;
    private String model;
    private int year;
    private String color;
    private String plate;
    private Long customerId;
}
