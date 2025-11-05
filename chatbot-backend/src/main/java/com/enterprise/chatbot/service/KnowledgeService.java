package com.enterprise.chatbot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class KnowledgeService {

    public static class Entry {
        public List<String> keywords = new ArrayList<>();
        public String reply;
    }

    private final List<Entry> entries = new ArrayList<>();

    @PostConstruct
    public void loadKnowledge() {
        try (InputStream is = getClass().getResourceAsStream("/knowledge.json")) {
            if (is == null) return;
            ObjectMapper m = new ObjectMapper();
            List<Entry> loaded = m.readValue(is, new TypeReference<List<Entry>>() {});
            entries.clear();
            entries.addAll(loaded);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public String findReply(String message) {
        if (message == null || message.trim().isEmpty()) {
            return null; // Let AI answer if user doesn't give a keyword
        }

        String t = message.toLowerCase();
        for (Entry e : entries) {
            for (String k : e.keywords) {
                if (t.contains(k.toLowerCase())) {
                    return e.reply;
                }
            }
        }

        return null; //  Gemini answer if no match
    }
}
