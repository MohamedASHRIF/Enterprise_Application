package com.enterprise.chatbot.service;

import okhttp3.*;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    private static final String API_KEY = System.getenv("GEMINI_API_KEY");
    private static final String URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String generateReply(String userMessage) throws Exception {

        if (API_KEY == null || API_KEY.isBlank()) {
            throw new IllegalStateException("❌ GEMINI_API_KEY is not set in system environment variables");
        }

        String json = """
        {
          "contents": [
            {
              "role": "system",
              "parts": [
                { "text": "You are an enterprise automobile service chatbot. Answer clearly and briefly." }
              ]
            },
            {
              "role": "user",
              "parts": [
                { "text": "%s" }
              ]
            }
          ]
        }
        """.formatted(userMessage);

        Request request = new Request.Builder()
                .url(URL + API_KEY)
                .post(RequestBody.create(json, MediaType.parse("application/json")))
                .build();

        Response response = client.newCall(request).execute();
        String body = response.body().string();

        System.out.println("\n🔍 Gemini Response:\n" + body + "\n");

        JsonNode root = mapper.readTree(body);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            return "Sorry, I couldn't generate a reply.";
        }

        JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
        return textNode.asText("Sorry, I couldn't generate a reply.");
    }
}
