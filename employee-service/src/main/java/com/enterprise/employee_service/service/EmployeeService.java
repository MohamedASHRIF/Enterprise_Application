package com.enterprise.employee_service.service;

import com.enterprise.employee_service.web.dto.UserDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeAuthClient authClient;

    public EmployeeService(EmployeeAuthClient authClient) {
        this.authClient = authClient;
    }

    public UserDto getLoggedInEmployee(String email, String token) {
        return authClient.getEmployeeByEmail(email, token);
    }

    public List<UserDto> getEmployeesByJobTitle(String jobTitle) {
        try {
            UserDto[] allEmployees = authClient.getAllEmployees();
            if (allEmployees == null) return List.of();

            return Arrays.stream(allEmployees)
                    .filter(e -> e.getRole() != null && e.getRole().name().equalsIgnoreCase("EMPLOYEE"))
                    .filter(e -> e.getJobTitle() != null && e.getJobTitle().equalsIgnoreCase(jobTitle))
                    .toList();

        } catch (Exception e) {
            log.error("❌ Failed to fetch employees from Auth Service: {}", e.getMessage());
            return List.of();
        }
    }
}
