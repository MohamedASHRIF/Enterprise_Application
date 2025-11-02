"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./chatbot.module.css";
import ChatBubble from "./ChatBubble";

type Message = { id: number; sender: "user" | "bot"; text: string };

const KEYWORDS = [
  "service",
  "employee",
  "auth",
  "authentication",
  "admin",
  "notification",
  "appointment",
  "customer",
  "vehicle",
  "schedule",
  "login",
  "register",
  "jwt",
  "token",
  "twilio",
  "rabbit",
  "rabbitmq",
  "email",
  "sms",
];

function generateBotReply(text: string) {
  const t = text.toLowerCase();
  const found = KEYWORDS.some((k) => t.includes(k));
  if (!found)
    return "Sorry — I can only answer questions about enterprise applications (authentication, services, notifications, employees, customers, appointments, vehicles, etc.).";

  // Build a short adaptive reply: take up to first two sentences or truncate
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  let reply = sentences.slice(0, 2).join(" ").trim();
  if (reply.length > 300) reply = reply.slice(0, 297) + "...";
  return `Here's a short reply about enterprise applications:\n${reply}`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // When the chat is opened for the first time (no messages), send a greeting from the bot
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        id: idRef.current++,
        sender: "bot",
        text: "Hi — how can I help you with the enterprise application today?",
      };
      setMessages((m) => [...m, greeting]);
    }
    // only run when open changes or number of messages changes
  }, [open, messages.length]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: idRef.current++, sender: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      const reply = generateBotReply(text);
      const botMsg: Message = { id: idRef.current++, sender: "bot", text: reply };
      setMessages((m) => [...m, botMsg]);
    }, 450);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className={styles.chatbotContainer}>
      <button
        aria-label="Open chatbot"
        className={styles.toggleButton}
        onClick={() => setOpen((o) => !o)}
      >
        {/* message icon to match other emoji icons used across the app */}
        ✉️
      </button>

      {open && (
        <div className={styles.chatWindow} role="dialog" aria-label="Chatbot">
          <div className={styles.header}>
            <span className={styles.title}>Enterprise Chatbot</span>
            <button
              aria-label="Close chatbot"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {messages.length === 0 && (
              <div className={styles.empty}>Ask me about the enterprise application (auth, services, notifications)...</div>
            )}
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m.text} sender={m.sender} />
            ))}
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.input}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className={styles.sendButton} onClick={sendMessage} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
