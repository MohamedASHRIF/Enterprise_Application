package com.enterprice.notification_system.Repository;

import com.enterprice.notification_system.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
