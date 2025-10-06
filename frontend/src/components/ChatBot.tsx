"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Using plain HTML elements instead of missing UI library components

import {
    X,
    MessageCircle,
    Send,
    Loader2,
    ArrowDownCircleIcon,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default function Chat() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    // show the chat icon by default so it's immediately available on the Dashboard
    const [showChatIcon, setShowChatIcon] = useState(true);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody?.error || `HTTP ${res.status}`);
            }

            // If the route returns a text stream, read it as text
            const text = await res.text();
            // The API may return a raw string or JSON — try parse JSON
            let assistantText = text;
            try {
                const parsed = JSON.parse(text);
                assistantText = parsed.reply || parsed.output || JSON.stringify(parsed);
            } catch (e) {
                // not JSON, keep text
            }

            const botMsg: ChatMessage = { role: "assistant", content: assistantText };
            setMessages((m) => [...m, botMsg]);
        } catch (err: any) {
            console.error("Chat error:", err);
            setError(err?.message || "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <AnimatePresence>
                {showChatIcon && (
                        <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <button onClick={toggleChat} className="rounded-full p-2 shadow-lg bg-white">
                            {isChatOpen ? <MessageCircle className="size-12" /> : <ArrowDownCircleIcon />}
                        </button>
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
                        <div className="border-2 bg-white rounded">
                            <div className="flex flex-row items-center justify-between p-3 border-b">
                                <div className="text-lg font-medium">Chat with AI</div>
                                <button onClick={toggleChat} className="px-2 py-0">
                                    <X className="size-4" />
                                    <span className="sr-only">Close chat </span>
                                </button>
                            </div>

                            <div className="h-[300px] pr-4 overflow-auto p-3">
                                {messages.length === 0 && (
                                    <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">No message yet.</div>
                                )}

                                {messages.map((message, index) => (
                                    <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                        <div className={`inline-block rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="w-full items-center flex justify-center gap-3">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary" />
                                        <button className="underline" type="button" onClick={() => setIsLoading(false)}>
                                            abort
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className="w-full items-center flex justify-center gap-3">
                                        <div>An error occurred: {error}</div>
                                        <button className="underline" type="button" onClick={() => setError(null)}>
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t">
                                <form onSubmit={submit} className="flex w-full items-center space-x-2">
                                    <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="Type your message here..." />
                                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded" disabled={isLoading}>
                                        <Send className="size-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
