package com.enterprise.chatbot.model;

public class ChatResponse {
    private String reply;
    private boolean related;

    public ChatResponse() {
    }

    public ChatResponse(String reply, boolean related) {
        this.reply = reply;
        this.related = related;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public boolean isRelated() {
        return related;
    }

    public void setRelated(boolean related) {
        this.related = related;
    }
}
