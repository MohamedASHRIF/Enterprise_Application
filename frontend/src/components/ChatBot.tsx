"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@/components/ui/Button";
import { X, Send, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// Lightweight local Input fallback to avoid "Cannot find module" errors.
// This mirrors the minimal props used in this file (value, onChange, className, placeholder, disabled).
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };
const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return <input {...props} className={`border rounded px-2 py-1 text-sm ${className}`} />;
};

// Fallback local ScrollArea component used when the external module is not available.
const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div {...props} className={`${className ?? ""} overflow-auto`}>
      {children}
    </div>
  );
};
export { ScrollArea };

// Local chat implementation (replaces missing external hook)
type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string; time?: string };

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowChatIcon(false);
      } else {
        setShowChatIcon(true);
        setIsChatOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleChat = () => setIsChatOpen((s) => !s);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const pushMessage = (role: ChatMessage["role"], content: string) => {
    const msg: ChatMessage = { id: String(Date.now()) + Math.random().toString(16).slice(2), role, content, time: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    return msg;
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  };

  const reload = async () => {
    setError(null);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      await submit(undefined, lastUser.content);
    }
  };

  const submit = async (e?: React.FormEvent, forcedText?: string) => {
    e?.preventDefault();
    const text = (forcedText ?? input).trim();
    if (!text) return;
    setError(null);
    setInput("");
    pushMessage("user", text);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { id: "pending", role: "user", content: text }] }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const textBody = await res.text();
      let assistantText = textBody;
      try {
        const parsed = JSON.parse(textBody);
        assistantText = parsed.reply || parsed.output || parsed.message || JSON.stringify(parsed);
      } catch {
        // keep plain text
      }

      pushMessage("assistant", assistantText || "No response");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        pushMessage("assistant", "Request aborted.");
      } else {
        setError(err?.message || "Unknown error");
        pushMessage("assistant", "Unable to reach the chat service. Try again later.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div>
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={toggleChat}
              size="icon"
              className="rounded-full p-2 shadow-lg bg-white hover:scale-[1.02] transition-transform"
            >
              {!isChatOpen ? <Bot className="h-6 w-6 text-white-700" /> : <X className="h-6 w-6 text-white-700" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <Card className="h-[580px] md:h-[520px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-slate-50">
                <CardTitle className="text-lg font-semibold text-slate-800">Chat with AI</CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={toggleChat} size="sm" variant="ghost" className="rounded-full p-2">
                    <X className="h-5 w-5 text-white-600 " />
                    <span className="sr-only">Close chat</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea ref={scrollRef as any} className="h-[300px] pr-4">
                  {messages.length === 0 && (
                    <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">No messages yet.</div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`inline-block rounded-lg p-2 ${
                          message.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="w-full items-center flex justify-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary" />
                      <button className="underline" type="button" onClick={() => stop()}>
                        Stop
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="w-full items-center flex justify-center gap-3">
                      <div>An error occured.</div>
                      <button className="underline" type="button" onClick={() => reload()}>
                        Retry
                      </button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <CardFooter className="border-t">
                <form onSubmit={submit} className="flex w-full items-center space-x-2">
                  <Input value={input} onChange={handleInputChange} className="flex-1" placeholder="Type your message" />
                  <Button type="submit" className="size-9" disabled={isLoading} size="icon">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 " />}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}