package com.enterprise.employee_service.service;

import com.enterprise.employee_service.web.dto.UserDto;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeAuthClient authClient;

    public EmployeeService(EmployeeAuthClient authClient) {
        this.authClient = authClient;
    }

    public UserDto getLoggedInEmployee(String email, String token) {
        return authClient.getEmployeeByEmail(email, token);
    }
}
