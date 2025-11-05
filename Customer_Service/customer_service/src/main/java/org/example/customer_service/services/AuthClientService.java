package org.example.customer_service.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class AuthClientService {

    @Autowired
    private WebClient webClient;

    public Long getCustomerIdByEmail(String email) {
        try {
            var response = webClient.get()
                    .uri("http://localhost:8083/api/auth/user/{email}", email) // <- correct path
                    .retrieve()
                    .bodyToMono(UserResponse.class)
                    .block();

            return response != null ? response.getId() : null;
        } catch (Exception e) {
            // log in real app
            return null;
        }
    }

    public static class UserResponse {
        private Long id;
        private String email;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
