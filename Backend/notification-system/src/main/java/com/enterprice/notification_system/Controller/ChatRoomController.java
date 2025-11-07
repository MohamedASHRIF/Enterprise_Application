package com.enterprice.notification_system.Controller;

import com.enterprice.notification_system.Entity.ChatRoom;
import com.enterprice.notification_system.Service.ChatRoomService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")

public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    public ChatRoomController(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    @GetMapping("/room/{customerEmail}")
    public ChatRoom getOrCreateRoom(@PathVariable String customerEmail) {
        ChatRoom chatRoom = chatRoomService.getOrCreateRoom(customerEmail);
        System.out.println(chatRoom.getRoomId());
        return chatRoomService.getOrCreateRoom(customerEmail);
    }
    @GetMapping("/rooms/active")
    public List<ChatRoom> getActiveRooms() {
        return chatRoomService.getActiveRooms();
    }

}
