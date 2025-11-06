package com.enterprice.notification_system.Entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessage {
    private String sender;       // e.g., admin@example.com
    private String receiver;     // e.g., user@example.com
    private String content;      // Message text
    private String type;         // "CHAT" | "JOIN" | "LEAVE"
    private LocalDateTime timestamp;
}
