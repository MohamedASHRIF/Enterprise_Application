package com.enterprise.chatbot.service;

import com.enterprise.chatbot.model.ChatResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final List<Map<String, Object>> data;

    public ChatService() throws IOException {
        // load dummy enterprise data from resources/enterprise-data.json
        ObjectMapper m = new ObjectMapper();
        ClassPathResource r = new ClassPathResource("enterprise-data.json");
        this.data = m.readValue(r.getInputStream(), new TypeReference<>() {
        });
    }

    public ChatResponse reply(String message) {
        if (message == null || message.trim().isEmpty()) {
            return new ChatResponse("Please provide a question.", false);
        }
        String lc = message.toLowerCase();

        // basic keyword matching: each data item has "keywords" (array) and "answer"
        for (Map<String, Object> item : data) {
            Object kws = item.get("keywords");
            if (kws instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> kwlist = (List<String>) kws;
                for (String kw : kwlist) {
                    if (lc.contains(kw.toLowerCase())) {
                        String ans = String.valueOf(item.getOrDefault("answer", ""));
                        return new ChatResponse(ans, true);
                    }
                }
            }
        }

        // if no keyword matched, return not-related message
        return new ChatResponse("Sorry — I can only answer questions related to the enterprise application.", false);
    }
}
