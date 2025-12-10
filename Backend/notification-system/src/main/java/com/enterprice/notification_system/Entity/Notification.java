package com.enterprice.notification_system.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String title;
    private String message;
    private String type;      // e.g., EMAIL, SMS
    private String status;    // e.g., UNREAD, READ
    private LocalDateTime createdAt;
}
