package com.enterprice.notification_system.Controller;

import com.enterprice.notification_system.DTO.NotificationDetailDTO;
import com.enterprice.notification_system.DTO.NotificationSummaryDTO;
import com.enterprice.notification_system.Entity.Notification;
import com.enterprice.notification_system.Service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get all notifications for a user
    @GetMapping("/{userEmail}")
    public List<Notification> getNotifications(@PathVariable String userEmail) {
        return notificationService.getNotifications(userEmail);
    }
    // Get summaries (lightweight list)
    @GetMapping("/summary/{userEmail}")
    public List<NotificationSummaryDTO> getNotificationSummaries(@PathVariable String userEmail) {
        return notificationService.getNotificationSummaries(userEmail);
    }

    // Get full detail for one notification
    @GetMapping("/detail/{id}")
    public NotificationDetailDTO getNotificationDetail(@PathVariable Long id) {
        return notificationService.getNotificationDetail(id);
    }

    // PATCH - Mark a single notification as read
    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    // PATCH - Mark all notifications as read for a specific user
    @PatchMapping("/mark-all-read")
    public void markAllAsRead(@RequestParam String userEmail) {
        notificationService.markAllAsRead(userEmail);
    }

    // DELETE - Delete a specific notification by ID
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}
