package com.example.customer.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.customer.service.AiService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final AiService aiService;

    @PostMapping("/api/chat")
    public ChatResponse handleChat(@RequestBody ChatRequest request) {
        try {
            String aiResponse = aiService.invokeAi(request.getSystemPrompt(), request.getUserPrompt());
            return new ChatResponse(aiResponse);
        } catch (Exception e) {
            System.err.println("Chat agent error: " + e.getMessage());
            return new ChatResponse("I apologize, but I encountered an error. Please try again.");
        }
    }
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String aiResponse = aiService.getAiResponse(request.getMessage());
        return new ChatResponse(aiResponse);
    }

    @Data
    public static class ChatRequest {
        private String systemPrompt;
        private String userPrompt;

        /**
         * Backwards-compatible accessor used by older callers that expect a single
         * message property. Prefer userPrompt if present, otherwise systemPrompt.
         */
        public String getMessage() {
            return userPrompt != null && !userPrompt.isEmpty() ? userPrompt : systemPrompt;
        }
    }
    @Data
    public static class ChatResponse {
        private String response;

        public ChatResponse(String response) {
            this.response = response;
        }
    }
}