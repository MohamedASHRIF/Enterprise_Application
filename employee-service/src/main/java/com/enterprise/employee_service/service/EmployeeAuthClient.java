package com.enterprise.employee_service.service;

import com.enterprise.employee_service.web.dto.UserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

            String url = authServiceUrl + "/users/email/" + email;
            ResponseEntity<UserDto> response = restTemplate.exchange(url, HttpMethod.GET, entity, UserDto.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching employee from Auth Service: " + e.getMessage());
        }
    }

    public UserDto[] getAllEmployees() {
        try {
            String url = authServiceUrl + "/users/employees";
            ResponseEntity<UserDto[]> response = restTemplate.getForEntity(url, UserDto[].class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all employees from Auth Service: " + e.getMessage());
        }
    }
}
