package org.example.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceSummaryDto {
    private Long id;
    private String name;
    private String description;
    private String category;
}
