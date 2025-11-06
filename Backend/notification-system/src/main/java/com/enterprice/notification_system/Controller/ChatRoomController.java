package com.enterprice.notification_system.Controller;

import com.enterprice.notification_system.Entity.ChatRoom;
import com.enterprice.notification_system.Service.ChatRoomService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    public ChatRoomController(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    @GetMapping("/room/{customerEmail}")
    public ChatRoom getOrCreateRoom(@PathVariable String customerEmail) {
        return chatRoomService.getOrCreateRoom(customerEmail);
    }
}
