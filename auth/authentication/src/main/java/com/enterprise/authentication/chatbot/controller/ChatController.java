package com.enterprise.authentication.chatbot.controller;

import com.enterprise.authentication.chatbot.model.ChatResponse;
import com.enterprise.authentication.chatbot.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
	private static final Logger log = LoggerFactory.getLogger(ChatController.class);

	private final ChatService chatService;

	public ChatController(ChatService chatService) {
		this.chatService = chatService;
	}

	@PostMapping
	public ResponseEntity<ChatResponse> chat(@RequestBody Map<String, String> body) {
		String message = body.getOrDefault("message", "");
		log.debug("Received chat message: {}", message);
		ChatResponse response = chatService.reply(message);
		return ResponseEntity.ok(response);
	}
}
