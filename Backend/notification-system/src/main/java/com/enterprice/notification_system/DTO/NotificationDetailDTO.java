package com.enterprice.notification_system.DTO;

import java.time.LocalDateTime;

public class NotificationDetailDTO {
    private Long id;
    private String userEmail;
    private String title;
    private String message;
    private String type;
    private String status;
    private LocalDateTime createdAt;

    public NotificationDetailDTO(Long id, String userEmail, String title, String message, String type, String status, LocalDateTime createdAt) {
        this.id = id;
        this.userEmail = userEmail;
        this.title = title;
        this.message = message;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
