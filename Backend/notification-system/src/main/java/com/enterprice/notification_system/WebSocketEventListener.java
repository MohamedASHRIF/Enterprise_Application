package com.enterprice.notification_system;

import com.enterprice.notification_system.Service.ChatRoomService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final ChatRoomService chatRoomService;

    public WebSocketEventListener(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    // When the customer connects to WebSocket
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String roomId = (String) headerAccessor.getFirstNativeHeader("roomId"); // 👈 Get from STOMP header
        if (roomId != null) {
            System.out.println("Customer connected to room: " + roomId);
            chatRoomService.updateActiveStatus(roomId, true);
        }
    }

    // When the customer disconnects
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        if (roomId != null) {
            System.out.println("Customer disconnected from room: " + roomId);
            chatRoomService.updateActiveStatus(roomId, false);
        }
    }
}