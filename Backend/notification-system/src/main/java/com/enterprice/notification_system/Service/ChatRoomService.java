package com.enterprice.notification_system.Service;

import com.enterprice.notification_system.Entity.ChatRoom;
import com.enterprice.notification_system.Repository.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository) {
        this.chatRoomRepository = chatRoomRepository;
    }

    public ChatRoom getOrCreateRoom(String customerEmail) {
        return chatRoomRepository.findByCustomerEmail(customerEmail)
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setCustomerEmail(customerEmail);
                    newRoom.setRoomId("room_" + UUID.randomUUID());
                    return chatRoomRepository.save(newRoom);
                });
    }
}
