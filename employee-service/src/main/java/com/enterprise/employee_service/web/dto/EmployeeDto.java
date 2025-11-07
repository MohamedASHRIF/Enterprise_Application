package com.enterprise.employee_service.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmployeeDto {
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @NotBlank
    @Email
    private String email;

    private String role;      // Optional: can be enum Role
    private String jobTitle;  // If you want to include from Auth service
}
