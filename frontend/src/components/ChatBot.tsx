"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, MessageCircle, Send, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string; id: string; time?: string };

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "Hi — how can I help you today?", time: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowChatIcon(true);
      } else {
        setShowChatIcon(false);
        setIsChatOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsChatOpen((s) => !s);
    setTimeout(() => textareaRef.current?.focus(), 200);
  };

  const pushMessage = (role: ChatMessage["role"], content: string) => {
    const msg: ChatMessage = { id: String(Date.now()) + Math.random().toString(16).slice(2), role, content, time: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    return msg;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError(null);
    setInput("");
    pushMessage("user", trimmed);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.concat([{ id: "pending", role: "user", content: trimmed }]) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const text = await res.text();
      let assistantText = text;
      try {
        const parsed = JSON.parse(text);
        assistantText = parsed.reply || parsed.output || parsed.message || JSON.stringify(parsed);
      } catch {
        // plain text
      }

      pushMessage("assistant", assistantText || "No response");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        pushMessage("assistant", "Request aborted.");
      } else {
        console.error("Chat error:", err);
        setError(err?.message || "Unknown error");
        pushMessage("assistant", "Unable to reach the chat service. Try again later.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence>
        {showChatIcon && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ duration: 0.18 }} className="fixed bottom-4 right-4 z-50">
            <button onClick={toggleChat} className="rounded-full p-2 shadow-lg bg-white hover:scale-[1.02] transition-transform" aria-label={isChatOpen ? "Close chat" : "Open chat"}>
              {isChatOpen ? <MessageCircle className="h-6 w-6 text-slate-700" /> : <Bot className="h-6 w-6 text-slate-700" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.18 }} className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[520px] max-w-[calc(100vw-32px)]">
            <div className="border rounded-lg bg-white shadow-xl flex flex-col overflow-hidden h-[580px] md:h-[520px]">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <div>
                  <div className="text-lg font-semibold text-slate-800">Chat with AI</div>
                  <div className="text-xs text-slate-500">Support • Quick answers</div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                    </div>
                  )}
                  <button onClick={() => setIsChatOpen(false)} className="p-1 rounded hover:bg-slate-100" aria-label="Close chat">
                    <X className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-gradient-to-b from-white to-slate-50">
                {messages.length === 0 && <div className="text-center text-slate-500 mt-8">No messages yet.</div>}

                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"} `}>
                      {!isUser && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400 text-white flex items-center justify-center text-sm font-semibold">AI</div>
                        </div>
                      )}

                      <div className={`max-w-[78%] break-words`}>
                        <div className={`inline-block px-3 py-2 rounded-lg shadow-sm ${isUser ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                        <div className={`text-[11px] mt-1 ${isUser ? "text-right text-slate-400" : "text-left text-slate-400"}`}>
                          {message.time ? new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </div>

                      {isUser && (
                        <div className="flex-shrink-0 ml-3">
                          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-violet-600 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold">Me</div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-sm text-slate-500">AI</div>
                    <div className="bg-slate-100 px-3 py-2 rounded-lg">
                      <div className="flex gap-1 items-center">
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-75" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-sm text-rose-600">
                    <div>{error}</div>
                    <button className="underline mt-1 text-xs" onClick={() => setError(null)}>Dismiss</button>
                  </div>
                )}

                <div className="h-2" />
              </div>

              <div className="px-4 py-3 border-t bg-white">
                <form onSubmit={submit} className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message here... (Enter to send, Shift+Enter for newline)"
                    className="resize-none min-h-[44px] max-h-[140px] w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={1}
                    aria-label="Message"
                  />
                  <div className="flex flex-col gap-2">
                    <button type="submit" className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60" disabled={isLoading} aria-label="Send">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>

                    <button type="button" onClick={() => { setInput(""); setError(null); }} className="text-xs text-slate-500 hover:text-slate-700" title="Clear input">
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}