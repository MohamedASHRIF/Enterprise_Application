package com.enterprise.chatbot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class KnowledgeService {

    public static class Entry {
        public List<String> keywords = new ArrayList<>();
        public String reply;
    }

    private final ObjectMapper mapper = new ObjectMapper();

    private String callGeminiApi(String url, String apiKey, String prompt) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            // ✅ Google Gemini expects this specific JSON structure
            Map<String, Object> bodyObj = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );
            String body = mapper.writeValueAsString(bodyObj);

            boolean useApiKeyInQuery = (apiKey != null && apiKey.startsWith("AIza"));
            URI uri = URI.create(url);
            if (useApiKeyInQuery) {
                String sep = url.contains("?") ? "&" : "?";
                uri = URI.create(url + sep + "key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8));
            }

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));

            if (!useApiKeyInQuery) {
                reqBuilder.header("Authorization", "Bearer " + apiKey);
            }

            HttpResponse<String> response = client.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
            String respBody = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                // ✅ Try to extract Gemini’s text reply
                try {
                    Map<String, Object> json = mapper.readValue(respBody, new TypeReference<Map<String, Object>>() {});
                    if (json.containsKey("candidates")) {
                        List<?> candidates = (List<?>) json.get("candidates");
                        if (!candidates.isEmpty()) {
                            Map<?, ?> first = (Map<?, ?>) candidates.get(0);
                            Map<?, ?> content = (Map<?, ?>) first.get("content");
                            if (content != null && content.containsKey("parts")) {
                                List<?> parts = (List<?>) content.get("parts");
                                if (!parts.isEmpty()) {
                                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                                    Object text = part.get("text");
                                    if (text != null) {
                                        return text.toString().trim();
                                    }
                                }
                            }
                        }
                    }
                    // fallback: raw JSON
                    return respBody;
                } catch (Exception ex) {
                    System.err.println("Error parsing Gemini response: " + ex.getMessage());
                    return respBody;
                }
            } else {
                System.err.println("Gemini API returned status " + response.statusCode() + ": " + respBody);
                return null;
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    private final List<Entry> entries = new ArrayList<>();

    @PostConstruct
    public void loadKnowledge() {
        try (InputStream is = getClass().getResourceAsStream("/knowledge.json")) {
            if (is == null) return;
            List<Entry> loaded = mapper.readValue(is, new TypeReference<List<Entry>>() {});
            entries.clear();
            entries.addAll(loaded);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public String findReply(String message) {
        try {
            String geminiUrl = System.getenv("GEMINI_API_URL");
            String geminiKey = System.getenv("GEMINI_API_KEY");
            if (geminiUrl != null && !geminiUrl.isBlank() && geminiKey != null && !geminiKey.isBlank()) {
                String out = callGeminiApi(geminiUrl, geminiKey, message);
                if (out != null && !out.isBlank()) return out;
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        if (message == null || message.trim().isEmpty()) {
            return "Please send a question about the enterprise application.";
        }

        String t = message.toLowerCase();
        for (Entry e : entries) {
            for (String k : e.keywords) {
                if (t.contains(k.toLowerCase())) {
                    return e.reply;
                }
            }
        }

        return "Sorry — I can only answer questions about enterprise applications (authentication, services, notifications, employees, customers, appointments, vehicles, etc.).";
    }
}
