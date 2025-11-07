"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./chat-widget.module.css";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatWidget(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function toggleOpen() {
    setOpen((v) => !v);
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // POST to Next.js API route which proxies to the backend service
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "chat proxy error");
      }
      const data = await res.json();
      const reply = data?.reply ?? data?.response ?? JSON.stringify(data);
      const botMsg: Message = { role: "assistant", text: String(reply) };
      setMessages((m) => [...m, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        role: "assistant",
        text: "Sorry, I couldn't get a response. " + (err?.message ?? ""),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container} aria-live="polite">
      {open && (
        <div className={styles.chatWindow} role="dialog" aria-label="Chat">
          <header className={styles.header}>
            <div className={styles.title}>Chat with Me</div>
            <button className={styles.close} onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.empty}>Hi! How can I help you?</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user" ? styles.msgUser : styles.msgAssistant
                }
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <input
              className={styles.input}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className={styles.send} type="submit" disabled={loading}>
              {loading ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}

      <button
        aria-label={open ? "Close chat" : "Open chat"}
        className={styles.iconButton}
        onClick={toggleOpen}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.iconSvg}
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
