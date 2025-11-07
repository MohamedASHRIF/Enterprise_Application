package com.enterprise.authentication.controller;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String email = String.valueOf(authentication.getPrincipal());
        User u = profileService.getByEmail(email);
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "firstName", u.getFirstName(),
                "lastName", u.getLastName(),
                "email", u.getEmail(),
                "phoneNumber", u.getPhoneNumber(),
                // address fields not stored in backend; return empty for now
                "address", "",
                "city", "",
                "state", "",
                "zipCode", "",
                "role", u.getRole().name()
        ));
    }

    public record UpdateProfileRequest(String firstName, String lastName, String phoneNumber) {}

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody UpdateProfileRequest req, Authentication authentication) {
        String email = String.valueOf(authentication.getPrincipal());
        User u = profileService.updateProfile(email, req.firstName(), req.lastName(), req.phoneNumber());
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "firstName", u.getFirstName(),
                "lastName", u.getLastName(),
                "email", u.getEmail(),
                "phoneNumber", u.getPhoneNumber()
        ));
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest req, Authentication authentication) {
        String email = String.valueOf(authentication.getPrincipal());
        profileService.changePassword(email, req.currentPassword(), req.newPassword());
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Password changed"));
    }
}


