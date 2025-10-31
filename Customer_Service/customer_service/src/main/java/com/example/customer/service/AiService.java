// ...existing code...
package com.example.customer.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ollama.url:http://localhost:11434/api/chat}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3}")
    private String model;

    // Gemini configuration (new)
    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-proto}")
    private String geminiModel;

    @Value("${gemini.endpoint:https://generativelanguage.googleapis.com/v1beta2/models/%s:generateText}")
    private String geminiEndpointFormat;

    /**
     * Invoke AI backend. If GEMINI API key is configured, call Gemini (Generative Language API).
     * Otherwise fall back to existing Ollama behavior.
     *
     * Note: For production with Google Gemini you should use the official client and proper
     * service account / OAuth flow. This example uses a simple Bearer token header (works
     * if you supply an OAuth access token); API-key-only approaches may require different handling.
     */
    public String invokeAi(String systemPrompt, String userPrompt) {
        // Build a combined prompt for simple text-generation endpoints
        String promptText = (systemPrompt == null ? "" : systemPrompt.trim()) +
                (systemPrompt == null || systemPrompt.isBlank() ? "" : "\n\n") +
                "User: " + (userPrompt == null ? "" : userPrompt.trim());

        // If Gemini key present, try Gemini first
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String endpoint = String.format(geminiEndpointFormat, geminiModel);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Expecting a Bearer token / access token for Gemini; adjust if you use API key differently
            headers.setBearerAuth(geminiApiKey);

            Map<String, Object> request = Map.of(
                    "prompt", Map.of("text", promptText),
                    "temperature", 0.2,
                    "maxOutputTokens", 512
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.postForObject(endpoint, entity, Map.class);

                if (response == null) {
                    System.err.println("AiService: empty response from Gemini");
                    return "I'm sorry — the AI service returned an empty response.";
                }

                // Try common Gemini shapes: "candidates" or "outputs"
                Object candidatesObj = response.get("candidates");
                if (candidatesObj instanceof List && !((List<?>) candidatesObj).isEmpty()) {
                    Object first = ((List<?>) candidatesObj).get(0);
                    if (first instanceof Map) {
                        Object content = ((Map<?, ?>) first).get("content");
                        if (content instanceof String) return (String) content;
                        Object output = ((Map<?, ?>) first).get("output");
                        if (output instanceof String) return (String) output;
                        Object text = ((Map<?, ?>) first).get("text");
                        if (text instanceof String) return (String) text;
                    } else {
                        return first.toString();
                    }
                }

                Object outputs = response.get("outputs");
                if (outputs instanceof List && !((List<?>) outputs).isEmpty()) {
                    Object first = ((List<?>) outputs).get(0);
                    if (first instanceof Map) {
                        Object text = ((Map<?, ?>) first).get("text");
                        if (text instanceof String) return (String) text;
                        Object content = ((Map<?, ?>) first).get("content");
                        if (content instanceof String) return (String) content;
                    } else {
                        return first.toString();
                    }
                }

                // Fallback: any top-level text-like fields
                Object text = response.get("text");
                if (text instanceof String) return (String) text;

                // Last resort: return serialized response for debugging (safe fallback)
                return response.toString();
            } catch (RestClientException e) {
                System.err.println("AiService: error calling Gemini at " + endpoint + " - " + e.getMessage());
                return "I'm sorry — the AI service is currently unreachable. Please try again later.";
            }
        }

        // Fallback to Ollama behavior if Gemini not configured
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> ollamaRequest = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "stream", false
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(ollamaRequest, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(ollamaUrl, entity, Map.class);
            if (response != null) {
                Object messageObj = response.get("message");
                if (messageObj instanceof Map) {
                    Object content = ((Map<?, ?>) messageObj).get("content");
                    if (content instanceof String) {
                        return (String) content;
                    }
                }

                Object outputs = response.get("outputs");
                if (outputs instanceof Iterable) {
                    for (Object out : (Iterable<?>) outputs) {
                        if (out instanceof Map) {
                            Object textField = ((Map<?, ?>) out).get("text");
                            if (textField instanceof String) return (String) textField;
                        }
                    }
                }
            }
            System.err.println("AiService: unexpected response from Ollama: " + response);
            return "I'm sorry — I couldn't understand the AI service response. Please try again later.";
        } catch (RestClientException e) {
            System.err.println("AiService: error calling Ollama at " + ollamaUrl + " - " + e.getMessage());
            return "I'm sorry — the AI service is currently unreachable. Please try again later.";
        }
    }

    /**
     * Convenience wrapper used by controllers that only supply a single message.
     */
    public String getAiResponse(String message) {
        return invokeAi("", message);
    }
}
// ...existing code...