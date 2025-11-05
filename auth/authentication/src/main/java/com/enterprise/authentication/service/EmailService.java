package com.enterprise.authentication.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {
    
    @Value("${notification.service.url:http://localhost:8082}")
    private String notificationServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public EmailService() {
        this.restTemplate = new RestTemplate();
    }
    
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String subject = "Email Verification - Enterprise Application";
        String verificationLink = "http://localhost:3000/verify-email?token=" + verificationToken;
        String body = String.format(
            "Dear User,\n\n" +
            "Thank you for registering with Enterprise Application.\n\n" +
            "Please verify your email address by clicking the link below:\n\n" +
            "%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Enterprise Application Team",
            verificationLink
        );
        
        sendEmail(toEmail, subject, body);
    }
    
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String subject = "Password Reset Request - Enterprise Application";
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        String body = String.format(
            "Dear User,\n\n" +
            "We received a request to reset your password for your Enterprise Application account.\n\n" +
            "Please reset your password by clicking the link below:\n\n" +
            "%s\n\n" +
            "This link will expire in 1 hour.\n\n" +
            "If you did not request a password reset, please ignore this email and your password will remain unchanged.\n\n" +
            "Best regards,\n" +
            "Enterprise Application Team",
            resetLink
        );
        
        sendEmail(toEmail, subject, body);
    }
    
    private void sendEmail(String toEmail, String subject, String body) {
        try {
            String url = notificationServiceUrl + "/api/email/send";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> emailRequest = new HashMap<>();
            emailRequest.put("toMail", toEmail);
            emailRequest.put("subject", subject);
            emailRequest.put("body", body);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(emailRequest, headers);
            
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            // Log the error but don't fail the registration/reset process
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
