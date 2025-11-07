package com.enterprise.chatbot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
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
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {

    @Value("${GEMINI_API_URL:}")
    private String geminiApiUrl;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    public static class Entry {
        public List<String> keywords = new ArrayList<>();
        public String reply;
    }

    private final List<Entry> entries = new ArrayList<>();

    // ---------------- GEMINI API CALL ----------------
    private String callGeminiApi(String url, String apiKey, String prompt) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            Map<String, Object> bodyObj = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))));
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
                try {
                    Map<String, Object> json = mapper.readValue(respBody, new TypeReference<>() {
                    });
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

    // ---------------- KNOWLEDGE LOADER ----------------
    @PostConstruct
    public void loadKnowledge() {
        try (InputStream is = getClass().getResourceAsStream("/knowledge.json")) {
            if (is == null)
                return;
            List<Entry> loaded = mapper.readValue(is, new TypeReference<List<Entry>>() {
            });
            entries.clear();
            entries.addAll(loaded);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    // ---------------- MAIN CHATBOT LOGIC ----------------
    public String findReply(String message) {
        try {
            System.out.println("GEMINI_API_URL = " + System.getenv("GEMINI_API_URL"));
            System.out.println("GEMINI_API_KEY = " + System.getenv("GEMINI_API_KEY"));

            String geminiUrl = System.getenv("GEMINI_API_URL");
            String geminiKey = System.getenv("GEMINI_API_KEY");

            // Handle availability queries first (always in-scope)
            if (isAvailabilityQuestion(message)) {
                try {
                    String date = extractDateOrToday(message);
                    Long serviceId = extractServiceId(message);
                    List<String> slots = fetchAvailabilitySlots(date, serviceId);

                    String slotsText = (slots == null || slots.isEmpty())
                            ? "No available slots"
                            : String.join(", ", slots);

                    // If the user asked about a specific time, answer whether that exact time is
                    // free
                    String requestedTime = extractTime(message); // returns HH:mm or null
                    if (requestedTime != null) {
                        boolean free = slots != null && slots.stream().anyMatch(s -> s.equals(requestedTime));
                        String simpleAnswer = free
                                ? ("Yes — " + date + " at " + requestedTime + " appears to be available.")
                                : ("No — " + date + " at " + requestedTime + " is not available.");

                        // If Gemini is configured, give it the availability context and ask to produce
                        // a friendly reply
                        if (geminiUrl != null && !geminiUrl.isBlank() && geminiKey != null && !geminiKey.isBlank()) {
                            String prompt = "User asked: \"" + message + "\"\n\n" +
                                    "Requested time: " + requestedTime + " on " + date + "\n" +
                                    "Live available slots: " + slotsText + "\n\n" +
                                    "Respond concisely whether the requested time is available, and if not, suggest the next available slots.";
                            String out = callGeminiApi(geminiUrl, geminiKey, prompt);
                            if (out != null && !out.isBlank())
                                return out;
                        }

                        // fallback templated response
                        if (free)
                            return simpleAnswer + " You can proceed to book it.";
                        // suggest next up to 5 slots
                        String suggestion = "";
                        if (slots != null && !slots.isEmpty()) {
                            suggestion = " Next available: "
                                    + String.join(", ", slots.subList(0, Math.min(5, slots.size()))) + ".";
                        }
                        return simpleAnswer + suggestion;
                    }

                    // Otherwise, provide full availability list (or let Gemini format it)
                    String prompt = "User asked: \"" + message + "\"\n\n" +
                            "Live availability for date " + date +
                            (serviceId != null ? (" (service id " + serviceId + ")") : "") +
                            ": " + slotsText +
                            "\n\nAnswer the user's question using the above availability.";

                    if (geminiUrl != null && !geminiUrl.isBlank() &&
                            geminiKey != null && !geminiKey.isBlank()) {
                        String out = callGeminiApi(geminiUrl, geminiKey, prompt);
                        if (out != null && !out.isBlank())
                            return out;
                    }

                    if (slots == null || slots.isEmpty()) {
                        return "I couldn't find any available time slots for " + date + ".";
                    }
                    return "Available slots on " + date + ": " + String.join(", ", slots);

                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }

            // Enforce application domain scope restriction
            if (!isInScopeOfApplication(message)) {
                return "Sorry, I’m designed to answer questions only about the Automobile Service Management System.";
            }

            // Use Gemini AI for valid in-scope queries
            if (geminiUrl != null && !geminiUrl.isBlank() && geminiKey != null && !geminiKey.isBlank()) {
                String out = callGeminiApi(geminiUrl, geminiKey, message);
                if (out != null && !out.isBlank())
                    return out;
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        // Local fallback (knowledge.json)
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

        return "Sorry — I can only answer questions about the Automobile Service Management System (authentication, services, notifications, employees, customers, appointments, vehicles, etc.).";
    }

    // ---------------- HELPER FUNCTIONS ----------------
    private boolean isAvailabilityQuestion(String message) {
        if (message == null)
            return false;
        String t = message.toLowerCase();
        return t.contains("available")
                || t.contains("availability")
                || t.contains("available slots")
                || t.contains("free slots")
                || t.contains("book")
                || t.contains("appointment")
                || t.contains("open")
                || t.contains("schedule")
                || t.contains("time slot");
    }

    private String extractDateOrToday(String message) {
        if (message == null)
            return LocalDate.now().toString();

        Matcher m = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})").matcher(message);
        if (m.find())
            return m.group(1);

        String t = message.toLowerCase();
        if (t.contains("tomorrow"))
            return LocalDate.now().plusDays(1).toString();
        if (t.contains("today"))
            return LocalDate.now().toString();

        return LocalDate.now().toString();
    }

    private Long extractServiceId(String message) {
        if (message == null)
            return null;
        Matcher m = Pattern.compile("service[_ ]?id[: ]?(\\d+)", Pattern.CASE_INSENSITIVE).matcher(message);
        if (m.find()) {
            try {
                return Long.valueOf(m.group(1));
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private String extractTime(String message) {
        if (message == null)
            return null;
        // Match times like "10", "10:00", "10am", "10:30 pm", optionally prefixed with
        // 'at'
        Matcher m = Pattern.compile("(?:at\\s*)?(\\b\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?\\b)", Pattern.CASE_INSENSITIVE)
                .matcher(message);
        if (!m.find())
            return null;
        String token = m.group(1).trim().toLowerCase().replaceAll("\\s+", "");
        try {
            java.time.LocalTime t = null;
            if (token.endsWith("am") || token.endsWith("pm")) {
                String up = token.toUpperCase();
                if (up.contains(":")) {
                    java.time.format.DateTimeFormatter f = java.time.format.DateTimeFormatter.ofPattern("h:mma");
                    t = java.time.LocalTime.parse(up, f);
                } else {
                    java.time.format.DateTimeFormatter f = java.time.format.DateTimeFormatter.ofPattern("ha");
                    t = java.time.LocalTime.parse(up, f);
                }
            } else if (token.contains(":")) {
                java.time.format.DateTimeFormatter f = java.time.format.DateTimeFormatter.ofPattern("H:mm");
                t = java.time.LocalTime.parse(token, f);
            } else {
                // plain hour number
                java.time.format.DateTimeFormatter f = java.time.format.DateTimeFormatter.ofPattern("H");
                t = java.time.LocalTime.parse(token, f);
            }
            return t.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception ex) {
            return null;
        }
    }

    private List<String> fetchAvailabilitySlots(String dateIso, Long serviceId) {
        try {
            String base = System.getenv().getOrDefault("CUSTOMER_SERVICE_URL", "http://localhost:8085");
            String url = base + "/api/public/availability?date=" +
                    URLEncoder.encode(dateIso, StandardCharsets.UTF_8);

            if (serviceId != null)
                url += "&serviceId=" + serviceId;

            System.out.println("Fetching availability URL: " + url);
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            System.out.println("Customer Service responded: status=" + res.statusCode());
            if (res.body() != null && !res.body().isBlank()) {
                System.out.println(
                        "Body: " + (res.body().length() > 1000 ? res.body().substring(0, 1000) + "..." : res.body()));
            }

            if (res.statusCode() >= 200 && res.statusCode() < 300) {
                Map<String, Object> json = mapper.readValue(res.body(), new TypeReference<>() {
                });
                Object slots = json.get("slots");
                if (slots instanceof List<?>) {
                    List<?> raw = (List<?>) slots;
                    return raw.stream().map(Object::toString).collect(Collectors.toList());
                }
            } else {
                System.err.println("Customer Service returned " + res.statusCode() + ": " + res.body());
            }

        } catch (Exception ex) {
            System.err.println("Error fetching availability: " + ex.toString());
            ex.printStackTrace();
        }

        return Collections.emptyList();
    }

    // ---------------- DOMAIN RESTRICTION ----------------
    private boolean isInScopeOfApplication(String message) {
        if (message == null || message.trim().isEmpty())
            return false;

        String t = message.toLowerCase();

        String[] keywords = {
                "login", "signup", "authentication", "dashboard", "service", "appointment",
                "vehicle", "car", "customer", "employee", "project", "progress", "time log",
                "book", "booking", "modification", "repair", "maintenance", "schedule",
                "available slots", "availability", "chatbot", "system", "enterprise",
                "backend", "frontend", "notification"
        };

        for (String k : keywords) {
            if (t.contains(k))
                return true;
        }

        return false;
    }
}
