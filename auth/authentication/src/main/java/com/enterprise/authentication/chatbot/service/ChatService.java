package com.enterprise.authentication.chatbot.service;

import com.enterprise.authentication.chatbot.model.ChatResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {
	private static final Logger log = LoggerFactory.getLogger(ChatService.class);

	private final List<Map<String, Object>> data = new ArrayList<>();

	public ChatService() {
		try {
			ObjectMapper m = new ObjectMapper();
			ClassPathResource r = new ClassPathResource("enterprise-data.json");
			List<Map<String, Object>> loaded = m.readValue(r.getInputStream(), new TypeReference<>() {});
			if (loaded != null) data.addAll(loaded);
			log.info("Loaded {} knowledge entries for chatbot", data.size());
		} catch (IOException e) {
			log.warn("Could not load enterprise-data.json for chatbot: {}", e.getMessage());
		}
	}

	/**
	 * Generate a reply using simple keyword matching against enterprise-data.json.
	 * Returns ChatResponse with reply text and a boolean "related" when a specific match is found.
	 */
	public ChatResponse reply(String message) {
		if (message == null || message.trim().isEmpty()) {
			return new ChatResponse("Please type a question or request.", false);
		}

		String lc = message.toLowerCase();

		// First pass: try to find a matching entry with keywords
		for (Map<String, Object> item : data) {
			Object kws = item.get("keywords");
			if (kws instanceof List) {
				@SuppressWarnings("unchecked")
				List<String> kwlist = (List<String>) kws;
				for (String kw : kwlist) {
					if (kw == null) continue;
					if (lc.contains(kw.toLowerCase())) {
						String ans = String.valueOf(item.getOrDefault("answer", ""));
						return new ChatResponse(ans, true);
					}
				}
			}
		}

		// No direct match: return a helpful fallback and optionally list topics
		StringBuilder sb = new StringBuilder();
		sb.append("I couldn't find an exact answer. I can help with topics like: ");
		// collect unique first keyword of each entry
		List<String> topics = new ArrayList<>();
		for (Map<String, Object> item : data) {
			Object kws = item.get("keywords");
			if (kws instanceof List) {
				@SuppressWarnings("unchecked")
				List<String> kwlist = (List<String>) kws;
				if (!kwlist.isEmpty()) topics.add(kwlist.get(0));
			}
		}
		// join up to 6 topics
		for (int i = 0; i < Math.min(6, topics.size()); i++) {
			if (i > 0) sb.append(", ");
			sb.append(topics.get(i));
		}
		sb.append(". Try asking about one of those.");

		return new ChatResponse(sb.toString(), false);
	}
}
