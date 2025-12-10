package com.enterprice.notification_system.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerEmail;  // Unique for each customer
    private String roomId;         // e.g., "room_customer_123"
}
