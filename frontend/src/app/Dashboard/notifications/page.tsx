'use client'
import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const CustomerChatRoom = ({ customerEmail }: { customerEmail: string }) => {
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ sender: string; content: string }>>([]);

  // 1️⃣ Fetch roomId from backend
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `http://localhost:8083/api/chat/room/${encodeURIComponent(customerEmail)}`
        );
        const data = await res.json();
        setRoomId(data.roomId);
      } catch (error) {
        console.error("Error fetching chat room:", error);
      }
    };
    fetchRoom();
  }, [customerEmail]);

  // 2️⃣ Once roomId is known → connect WebSocket
  useEffect(() => {
    if (!roomId) return;

    const socket = new SockJS("http://localhost:8083/ws");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("Connected to WebSocket for room:", roomId);

      client.subscribe(`/topic/room/${roomId}`, (msg) => {
        const received = JSON.parse(msg.body);
        setMessages((prev) => [...prev, received]);
      });
    });

    setStompClient(client);

    return () => {
      if (client.connected) {
        client.disconnect(() => {});
      }
      setStompClient(null);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (stompClient && message.trim()) {
      const chatMessage = {
        roomId,
        sender: customerEmail,
        content: message,
        type: "CHAT",
      };
      stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-3">Customer Chat</h2>

      {!roomId ? (
        <p>Loading chat room...</p>
      ) : (
        <>
          <div className="h-64 overflow-y-auto border p-2 mb-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`my-1 ${
                  msg.sender === customerEmail ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-3 py-1 rounded-lg ${
                    msg.sender === customerEmail
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerChatRoom;