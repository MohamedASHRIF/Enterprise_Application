package com.enterprice.notification_system.Controller;

import com.enterprice.notification_system.Entity.Notification;
import com.enterprice.notification_system.Service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userEmail}")
    public List<Notification> getNotifications(@PathVariable String userEmail) {
        return notificationService.getNotifications(userEmail);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}
