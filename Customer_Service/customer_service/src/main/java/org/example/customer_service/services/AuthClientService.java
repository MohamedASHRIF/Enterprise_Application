package org.example.customer_service.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
public class AuthClientService {

    @Autowired
    private WebClient webClient;

    public Long getCustomerIdByEmail(String email) {
        try {
            String url = "http://localhost:8081/api/auth/user?email=" + java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8);
            var response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(status -> status == HttpStatus.NOT_FOUND, clientResponse -> {
                        // Handle 404 (user not found) gracefully - return empty Mono
                        return Mono.empty();
                    })
                    .bodyToMono(UserResponse.class)
                    .block();

            return response != null ? response.getId() : null;
        } catch (WebClientResponseException e) {
            // Handle 404 (user not found) gracefully
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                System.err.println("User not found in auth service: " + email);
                return null;
            }
            // Other errors
            System.err.println("Error fetching customer ID from auth service: " + e.getMessage());
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            // log in real app
            System.err.println("Error fetching customer ID from auth service: " + e.getMessage());
            e.printStackTrace();
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
