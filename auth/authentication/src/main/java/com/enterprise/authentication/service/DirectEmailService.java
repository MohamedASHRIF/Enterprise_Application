package com.enterprise.authentication.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class DirectEmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    public DirectEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Send email verification link to user
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String subject = "Email Verification - Enterprise Application";
        String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;
        
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
    
    /**
     * Send password reset link to user
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String subject = "Password Reset Request - Enterprise Application";
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
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
    
    /**
     * Core method to send email using Spring Mail
     */
    private void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
            // Log but don't fail the registration/reset process
            e.printStackTrace();
        }
    }
}
