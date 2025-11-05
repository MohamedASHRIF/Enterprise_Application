package org.example.customer_service.controllers;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? String.valueOf(auth.getPrincipal()) : null;

        Claims claims = (Claims) request.getAttribute("jwtClaims");
        Object id = claims != null ? claims.get("id") : null;
        Object role = claims != null ? claims.get("role") : null;

        return ResponseEntity.ok(Map.of(
                "email", email,
                "id", id,
                "role", role
        ));
    }
}
