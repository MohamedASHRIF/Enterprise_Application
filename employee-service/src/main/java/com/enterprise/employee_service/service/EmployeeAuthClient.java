package com.enterprise.employee_service.service;

import com.enterprise.employee_service.web.dto.UserDto;
import com.enterprise.employee_service.web.dto.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmployeeAuthClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public EmployeeAuthClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserDto getEmployeeByEmail(String email, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setAccept(MediaType.parseMediaTypes("application/json"));
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = authServiceUrl + "/employees/email/" + email;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> employeeData = response.getBody();
            if (employeeData == null) {
                throw new RuntimeException("Employee not found");
            }
            
            return mapToUserDto(employeeData);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching employee from Auth Service: " + e.getMessage(), e);
        }
    }

    public UserDto[] getAllEmployees() {
        try {
            // Use /all endpoint which returns List<EmployeeListItem>
            String url = authServiceUrl + "/employees/all";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            List<Map<String, Object>> employeeList = response.getBody();
            if (employeeList == null || employeeList.isEmpty()) {
                return new UserDto[0];
            }
            
            return employeeList.stream()
                .map(this::mapToUserDto)
                .toArray(UserDto[]::new);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all employees from Auth Service: " + e.getMessage(), e);
        }
    }

    private UserDto mapToUserDto(Map<String, Object> employeeData) {
        UserDto dto = new UserDto();
        
        if (employeeData.get("id") != null) {
            dto.setId(Long.valueOf(employeeData.get("id").toString()));
        }
        dto.setFirstName((String) employeeData.get("firstName"));
        dto.setLastName((String) employeeData.get("lastName"));
        dto.setEmail((String) employeeData.get("email"));
        dto.setPhoneNumber((String) employeeData.get("phoneNumber"));
        dto.setJobTitle((String) employeeData.get("jobTitle"));
        
        // Map role string to Role enum
        String roleStr = (String) employeeData.get("role");
        if (roleStr != null) {
            try {
                dto.setRole(Role.valueOf(roleStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Default to EMPLOYEE if role doesn't match
                dto.setRole(Role.EMPLOYEE);
            }
        }
        
        return dto;
    }
}
