"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // auto-scroll when messages change
  useEffect(() => {
    if (!open) return;
    const el = messagesRef.current;
    if (!el) return;
    // allow layout to settle
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 40);
  }, [messages, open]);

  const toggle = () => setOpen((v) => !v);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user" as const, text };
    // append user message
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // demo bot reply (placeholder) appended after a short delay
    setTimeout(() => {
      const botReply = generateBotReply(text);
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    }, 600);
  };

  // Simple local reply generator to avoid echoing the user's exact text.
  // This is a placeholder for a real backend/chatbot integration.
  function generateBotReply(userText: string) {
    const t = userText.toLowerCase();
    if (t.includes("help") || t.includes("support")) {
      return "I can help with that — can you share a few more details?";
    }
    if (t.includes("price") || t.includes("cost") || t.includes("charge")) {
      return "For pricing details, please tell me which service or product you're interested in.";
    }
    if (t.includes("error") || t.includes("bug") || t.includes("issue")) {
      return "Sorry to hear that — can you paste the error or describe what you expected?";
    }
    if (t.endsWith("?")) {
      return "Good question — I'll look into that and get back to you shortly.";
    }
    // fallback reply
    return "Thanks for your message — our team will get back to you soon.";
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div
        className={`${styles.container} ${open ? styles.open : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.window} role="dialog" aria-label="Chatbot window">
          <div className={styles.header}>
            <div className={styles.title}>Chat With Me</div>
            <button className={styles.closeBtn} aria-label="Close chat" onClick={toggle}>
              ×
            </button>
          </div>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.from === "user" ? styles.messageUser : styles.messageBot}
                aria-live={m.from === "bot" ? "polite" : undefined}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form
            className={styles.inputArea}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Type a message"
            />
            <button type="submit" className={styles.sendBtn} aria-label="Send message">
              Send
            </button>
          </form>
        </div>
      </div>

      <button
        className={`${styles.iconButton} ${open ? styles.iconOpen : ""}`}
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-pressed={open}
        aria-expanded={open}
      >
        {/* Chat SVG icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
};

export default Chatbot;
