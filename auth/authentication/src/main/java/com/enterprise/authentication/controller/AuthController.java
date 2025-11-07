// package com.enterprise.authentication.controller;

// import com.enterprise.authentication.entity.User;
// import com.enterprise.authentication.service.AuthenticationService;
// import com.enterprise.authentication.service.UserService;
// import com.enterprise.authentication.util.JwtUtil;
// import java.util.Map;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/auth")
// public class AuthController {
//     private final AuthenticationService authenticationService;
//     private final JwtUtil jwtUtil;
//     private final UserService userService;

//     @Autowired
//     public AuthController(AuthenticationService authenticationService, JwtUtil jwtUtil, UserService userService) {
//         this.authenticationService = authenticationService;
//         this.jwtUtil = jwtUtil;
//         this.userService = userService;
//     }

//     @PostMapping("/register")
//     public ResponseEntity<?> register(@RequestBody User user) {
//         User savedUser = authenticationService.registerUser(user);
//         String token = jwtUtil.generateToken(savedUser.getEmail());
//         // Return both token and user data
//         return ResponseEntity.ok(Map.of(
//                 "token", token,
//                 "user", Map.of(
//                         "id", savedUser.getId(),
//                         "firstName", savedUser.getFirstName(),
//                         "lastName", savedUser.getLastName(),
//                         "email", savedUser.getEmail(),
//                         "phoneNumber", savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : "",
//                         "role", savedUser.getRole().toString()
//                 )
//         ));
//     }

//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
//         String email = loginRequest.get("email");
//         String password = loginRequest.get("password");
//         return authenticationService.authenticate(email, password)
//                 .map(user -> {
//                     String token = jwtUtil.generateToken(user.getEmail());
//                     // Return both token and user data
//                     return ResponseEntity.ok(Map.of(
//                             "token", token,
//                             "user", Map.of(
//                                     "id", user.getId(),
//                                     "firstName", user.getFirstName(),
//                                     "lastName", user.getLastName(),
//                                     "email", user.getEmail(),
//                                     "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
//                                     "role", user.getRole().toString()
//                             )
//                     ));
//                 })
//                 .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
//     }
//     @GetMapping("/user/{email}")
//     public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
//         return userService.findByEmail(email)
//                 .map(user -> ResponseEntity.ok(Map.of(
//                         "id", user.getId(),
//                         "email", user.getEmail()
//                 )))
//                 .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
//     }

// }
package com.enterprise.authentication.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.service.AuthenticationService;
import com.enterprise.authentication.service.UserService;
import com.enterprise.authentication.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${customer.service.url:http://localhost:8085}")
    private String customerServiceUrl;

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
    // Best-effort: create a corresponding customer record in customer-service
    try {
        RestTemplate rest = new RestTemplate();
        Map<String, Object> customerPayload = Map.of(
            "userId", savedUser.getId(),
            "name", (savedUser.getFirstName() == null ? "" : savedUser.getFirstName()) +
                (savedUser.getLastName() == null ? "" : " " + savedUser.getLastName()),
            "email", savedUser.getEmail(),
            "phone", savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : ""
        );
        logger.info("Auth: attempting POST to Customer-service {} with payload={}", customerServiceUrl + "/api/customers", customerPayload);
        // POST /api/customers - capture response for debugging
        Map response = rest.postForObject(customerServiceUrl + "/api/customers", customerPayload, Map.class);
        logger.info("Auth: customer-service response for {} -> {}", savedUser.getEmail(), response);
        logger.debug("Posted new customer to {} for user {}", customerServiceUrl, savedUser.getEmail());
    } catch (Exception ex) {
        // Non-fatal: log and continue
        logger.warn("Failed to create customer record in customer-service for user {}: {}", savedUser.getEmail(), ex.toString());
    }

    // Return both token and user data
    return ResponseEntity.ok(Map.of(
        "token", token,
        "message", "Registration successful! Please check your email to verify your account.",
        "user", Map.of(
            "id", savedUser.getId(),
            "firstName", savedUser.getFirstName(),
            "lastName", savedUser.getLastName(),
            "email", savedUser.getEmail(),
            "phoneNumber", savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : "",
            "role", savedUser.getRole().toString(),
            "emailVerified", Boolean.TRUE.equals(savedUser.getEmailVerified())
        )
    ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        // First check if user exists and password is correct
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Check if email is verified before attempting authentication
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Email not verified. Please check your email and verify your account.",
                    "emailVerified", false
                ));
            }
        }
        
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
                                    "role", user.getRole().toString(),
                                    "emailVerified", Boolean.TRUE.equals(user.getEmailVerified())
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

    /**
     * Minimal, explicit endpoint to create/sync a customer record in customer-service for a given user email.
     * Accepts JSON: { "email": "user@example.com" }
     * This is best-effort and will not modify existing registration/login behavior.
     */
    @PostMapping("/sync-customer")
    public ResponseEntity<?> syncCustomer(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "email is required"));
        }

        return userService.findByEmail(email)
                .map(savedUser -> {
                    try {
                        RestTemplate rest = new RestTemplate();
            Map<String, Object> customerPayload = Map.of(
                "userId", savedUser.getId(),
                "name", (savedUser.getFirstName() == null ? "" : savedUser.getFirstName()) +
                    (savedUser.getLastName() == null ? "" : " " + savedUser.getLastName()),
                "email", savedUser.getEmail(),
                "phone", savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : ""
            );
                        rest.postForObject(customerServiceUrl + "/api/customers", customerPayload, Map.class);
                        logger.debug("syncCustomer: posted customer for {} to {}", savedUser.getEmail(), customerServiceUrl);
                        return ResponseEntity.ok(Map.of("success", true));
                    } catch (Exception ex) {
                        logger.warn("syncCustomer: failed to post customer for {}: {}", savedUser.getEmail(), ex.getMessage());
                        return ResponseEntity.status(502).body(Map.of("error", "failed to create customer", "detail", ex.getMessage()));
                    }
                })
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean verified = authenticationService.verifyEmail(token);
        if (verified) {
            return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully",
                "success", true
            ));
        } else {
            return ResponseEntity.status(400).body(Map.of(
                "error", "Invalid or expired verification token",
                "success", false
            ));
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email is required"));
        }
        
        boolean requested = authenticationService.requestPasswordReset(email);
        if (requested) {
            return ResponseEntity.ok(Map.of(
                "message", "Password reset email sent successfully",
                "success", true
            ));
        } else {
            // For security, we don't reveal if the email exists or not
            return ResponseEntity.ok(Map.of(
                "message", "If the email exists, a password reset link will be sent",
                "success", true
            ));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Token is required"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.status(400).body(Map.of("error", "Password must be at least 6 characters"));
        }
        
        boolean reset = authenticationService.resetPassword(token, newPassword);
        if (reset) {
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully",
                "success", true
            ));
        } else {
            return ResponseEntity.status(400).body(Map.of(
                "error", "Invalid or expired reset token",
                "success", false
            ));
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email is required"));
        }
        
        boolean resent = authenticationService.resendVerificationEmail(email);
        if (resent) {
            return ResponseEntity.ok(Map.of(
                "message", "Verification email sent successfully",
                "success", true
            ));
        } else {
            return ResponseEntity.status(400).body(Map.of(
                "error", "Email not found or already verified",
                "success", false
            ));
        }
    }

}