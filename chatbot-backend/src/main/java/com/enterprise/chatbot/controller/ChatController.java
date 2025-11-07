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
        // Safely extract user message
        String message = body.getOrDefault("message", "").trim();

        // Validate input
        if (message.isEmpty()) {
            return ResponseEntity.ok(Map.of("reply", 
                "Please type a question related to the Automobile Service Management System."));
        }

        // Always process through KnowledgeService (includes restriction + Gemini)
        String reply = knowledgeService.findReply(message);

        // Return the structured response
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    // A simple GET endpoint for quick health or ping checks
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "Chatbot API is running"));
    }
}
