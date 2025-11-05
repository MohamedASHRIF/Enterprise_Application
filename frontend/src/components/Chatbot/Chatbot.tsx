"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Chatbot.module.css";

// Local implementation of sendChatMessage to avoid missing module error.
// Replace this with an actual import from your backend/api when available.
async function sendChatMessage(text: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    return data?.reply ?? "Sorry, I couldn't understand the response.";
  } catch {
    // Fallback message if network or server fails
    return "Sorry, I couldn't reach the chatbot backend. Please try again later.";
  }
}

type Msg = { from: "bot" | "user"; text: string };

export default function Chatbot(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // initial greeting when the chat opens first time
    if (open && messages.length === 0) {
      setMessages([{ from: "bot", text: "Hi! how can I help you today?" }]);
    }
  }, [open]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const reply = await sendChatMessage(text);
      const botMsg: Msg = { from: "bot", text: reply };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const botMsg: Msg = {
        from: "bot",
        text: "Sorry, I couldn't reach the chatbot backend. Please try again later.",
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.fabContainer}>
        <button
          className={styles.fab}
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.pulse} />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="currentColor"
            />
          </svg>
        </button>
        
      </div>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Chat window">
          <div className={styles.header}>
            <div>Chat With Me</div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className={styles.messages} ref={containerRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.from === "bot" ? styles.botMsg : styles.userMsg}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              className={styles.input}
              aria-label="Message"
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={sending}
              aria-label="Send message"
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
