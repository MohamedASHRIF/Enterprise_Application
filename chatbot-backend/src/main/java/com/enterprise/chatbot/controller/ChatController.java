package com.enterprise.chatbot.controller;

import com.enterprise.chatbot.model.ChatResponse;
import com.enterprise.chatbot.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        ChatResponse response = chatService.reply(message);
        return ResponseEntity.ok(response);
    }
}
