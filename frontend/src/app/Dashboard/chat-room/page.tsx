'use client';

import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

const CustomerChatRoom = ({ customerEmail }: { customerEmail: string }) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ sender: string; content: string }>>([]);

  const customerEmailtest = "john@example.com";

  // Fetch chat room from backend
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `http://localhost:8083/api/chat/room/${encodeURIComponent(customerEmailtest)}`
        );
        const data = await res.json();
        setRoomId(data.roomId);
        console.log("Fetched roomId:", data.roomId);
      } catch (error) {
        console.error("Error fetching chat room:", error);
      }
    };
    fetchRoom();
  }, [customerEmail]);

  // Connect WebSocket
  useEffect(() => {
    if (!roomId) return;

    const socket = new SockJS("http://localhost:8083/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ Connected to WebSocket for room:", roomId);

        client.subscribe(`/topic/room/${roomId}`, (msg: IMessage) => {
          const received = JSON.parse(msg.body);
          setMessages((prev) => [...prev, received]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) client.deactivate();
      setStompClient(null);
    };
  }, [roomId]);

  // Send message
  const sendMessage = () => {
    if (stompClient && message.trim()) {
      const chatMessage = {
        roomId,
        sender: customerEmail,
        content: message,
        type: "CHAT",
      };
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setMessage("");
    }
  };

  // 🔹 Full-screen but nicely centered layout
  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 px-4 md:px-16 lg:px-32 py-6">
      {/* Chat Card Container */}
      <div className="flex flex-col flex-1 bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow rounded-t-2xl">
          <h2 className="text-xl font-semibold">💬 Customer Chat</h2>
          <span className="text-sm opacity-80">{customerEmail}</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {!roomId ? (
            <div className="text-center text-gray-500 animate-pulse mt-10">
              Loading chat room...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.sender === customerEmail;
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                      isUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="flex items-center gap-3 border-t bg-white p-4 shadow-inner rounded-b-2xl">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-full text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerChatRoom;
