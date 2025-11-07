'use client';

import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

type ChatRoom = {
  roomId: string;
  customerEmail: string;
};

type ChatMessage = {
  roomId?: string;
  sender: string;
  content: string;
  type?: string;
  timestamp?: string | number;
};

const EmployeeChatRoom = ({ employeeEmail }: { employeeEmail: string }) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all active chat rooms (backend returns only active)
  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:8083/api/chat/rooms/active");
      const data = await res.json();
      setChatRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  // Connect WebSocket and subscribe to each active room
  useEffect(() => {
    if (chatRooms.length === 0) return;

    const socket = new SockJS("http://localhost:8083/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Employee connected to WebSocket");

        chatRooms.forEach((room) => {
          client.subscribe(`/topic/room/${room.roomId}`, (msg: IMessage) => {
            const received = JSON.parse(msg.body);
            setMessages((prev) => ({
              ...prev,
              [room.roomId]: [...(prev[room.roomId] || []), received],
            }));
          });
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
  }, [chatRooms]);

  // Send message to a specific room
  const sendMessage = () => {
    if (!stompClient || !selectedRoom || !newMessage.trim()) return;

    const chatMessage = {
      roomId: selectedRoom,
      sender: employeeEmail,
      content: newMessage,
      type: "CHAT",
    };

    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b bg-blue-600 text-white rounded-tr-xl">
          <h2 className="text-lg font-semibold">Active Customer Chats</h2>
          <p className="text-xs text-blue-100 mt-1">Signed in as {employeeEmail}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {chatRooms.length === 0 ? (
            <div className="text-gray-500 text-center mt-10 text-sm">
              No active chat rooms
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => setSelectedRoom(room.roomId)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition ${
                  selectedRoom === room.roomId
                    ? "bg-blue-600 text-white shadow"
                    : "hover:bg-blue-100 text-gray-700"
                }`}
              >
                <div className="font-medium text-sm">{room.customerEmail}</div>
                <div className="text-xs opacity-75">Room: {room.roomId}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-lg rounded-tl-xl">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white rounded-tl-xl">
              <h3 className="text-lg font-semibold">
                Chat with{" "}
                {chatRooms.find((r) => r.roomId === selectedRoom)?.customerEmail}
              </h3>
              <span className="text-xs opacity-75">
                Room ID: {selectedRoom}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {(messages[selectedRoom] || []).length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                (messages[selectedRoom] || []).map((msg, i) => {
                  const isOwn = msg.sender === employeeEmail;
                  return (
                    <div
                      key={i}
                      className={`flex mb-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-[10px] opacity-70 block mt-1">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4 flex items-center gap-3 shadow-inner">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-full text-sm font-medium"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg font-medium">
            Select a customer to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeChatRoom;
