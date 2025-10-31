package com.enterprise.employee_service.service;

import com.enterprise.employee_service.web.dto.UserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmployeeAuthClient {

    private final RestTemplate restTemplate;

    // Base URL for Auth Service (set in application.properties)
    @Value("${auth.service.url}")
    private String authServiceUrl;

    public EmployeeAuthClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetch employee (user) details from Auth Service using email and JWT token.
     *
     * @param email Employee's email (used to identify user in Auth DB)
     * @param token JWT Bearer token (from login)
     * @return UserDto containing employee info
     */
    public UserDto getEmployeeByEmail(String email, String token) {
        try {
            // Set headers with Authorization
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setAccept(MediaType.parseMediaTypes("application/json"));

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Construct full URL, e.g., http://localhost:8081/api/auth/users/email/john@gmail.com
            String url = authServiceUrl + "/email/" + email;

            ResponseEntity<UserDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    UserDto.class
            );

            return response.getBody();
        } catch (Exception e) {
            System.err.println("❌ Error fetching employee from Auth Service: " + e.getMessage());
            return null;
        }
    }
}
