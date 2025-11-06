package org.example.customer_service.controllers;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.example.customer_service.services.AuthClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private AuthClientService authClientService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? String.valueOf(auth.getPrincipal()) : null;

        Claims claims = (Claims) request.getAttribute("jwtClaims");
        Object id = claims != null ? claims.get("id") : null;
        Object role = claims != null ? claims.get("role") : null;

        // If ID is not in token (old token), try to fetch it from auth service
        if (id == null && email != null) {
            Long userId = authClientService.getCustomerIdByEmail(email);
            if (userId != null) {
                id = userId;
            }
        }

        // Use HashMap instead of Map.of() to allow null values
        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("id", id);
        response.put("role", role);

        return ResponseEntity.ok(response);
    }
}
