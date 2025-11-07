package com.enterprise.chatbot.controller;

import com.enterprise.chatbot.service.KnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final KnowledgeService knowledgeService;

    public ChatController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        String reply = knowledgeService.findReply(message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
