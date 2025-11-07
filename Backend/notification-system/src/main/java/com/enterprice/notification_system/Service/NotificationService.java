package com.enterprice.notification_system.Service;

import com.enterprice.notification_system.DTO.NotificationDetailDTO;
import com.enterprice.notification_system.DTO.NotificationSummaryDTO;
import com.enterprice.notification_system.Entity.Notification;
import com.enterprice.notification_system.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void createNotification(String userEmail, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserEmail(userEmail);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus("UNREAD");
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);

        // Send to WebSocket in real time
        messagingTemplate.convertAndSend("/topic/notifications/" + userEmail, savedNotification);
    }

    public List<Notification> getNotifications(String userEmail) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setStatus("READ");
        notificationRepository.save(n);
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByUserEmailAndStatus(userEmail, "UNREAD");
    }

    public void markAllAsRead(String userEmail) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        for (Notification n : notifications) {
            if ("UNREAD".equals(n.getStatus())) {
                n.setStatus("READ");
            }
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
    public List<NotificationSummaryDTO> getNotificationSummaries(String userEmail) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        return notifications.stream()
                .map(n -> new NotificationSummaryDTO(
                        n.getId(),
                        n.getTitle(),
                        n.getStatus(),
                        n.getCreatedAt()))
                .toList();
    }
    public NotificationDetailDTO getNotificationDetail(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        return new NotificationDetailDTO(
                n.getId(),
                n.getUserEmail(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getStatus(),
                n.getCreatedAt());
    }
}
