package org.example.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.customer_service.models.AppointmentStatus;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummaryDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerFirstName;
    private String customerLastName;
    private VehicleSummaryDto vehicle;
    private ServiceSummaryDto service;
    private EmployeeSummaryDto employee;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private AppointmentStatus status;
    private String estimatedDuration;
}
