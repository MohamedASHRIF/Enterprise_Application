package com.enterprice.notification_system.DTO;

import java.time.LocalDateTime;

public class NotificationSummaryDTO {
    private Long id;
    private String title;
    private String status;
    private LocalDateTime createdAt;

    public NotificationSummaryDTO(Long id, String title, String status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
