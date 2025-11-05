package com.enterprise.authentication.controller;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.service.AuthenticationService;
import com.enterprise.authentication.service.UserService;
import com.enterprise.authentication.util.JwtUtil;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Autowired
    public AuthController(AuthenticationService authenticationService, JwtUtil jwtUtil, UserService userService) {
        this.authenticationService = authenticationService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User savedUser = authenticationService.registerUser(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        // Return both token and user data
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", savedUser.getId(),
                        "firstName", savedUser.getFirstName(),
                        "lastName", savedUser.getLastName(),
                        "email", savedUser.getEmail(),
                        "phoneNumber", savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : "",
                        "role", savedUser.getRole().toString()
                )
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        return authenticationService.authenticate(email, password)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmail());
                    // Return both token and user data
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", Map.of(
                                    "id", user.getId(),
                                    "firstName", user.getFirstName(),
                                    "lastName", user.getLastName(),
                                    "email", user.getEmail(),
                                    "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                                    "role", user.getRole().toString()
                            )
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }
    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "email", user.getEmail()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

}