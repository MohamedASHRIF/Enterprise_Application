"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null
  );
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState<any>(null);

  const userEmail = "john@example.com"; // TODO: make dynamic later

  // 🔹 Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8083/api/notifications/summary/${userEmail}`
      );
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Initialize WebSocket connection
  useEffect(() => {
    // Load initial notifications
    fetchNotifications();

    // WebSocket setup using @stomp/stompjs + SockJS (browser-friendly)
    const client = new Client({
      // using SockJS via webSocketFactory because backend exposes SockJS endpoint
      webSocketFactory: () => new SockJS("http://localhost:8083/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        // Subscribe to real-time topic for this user
        client.subscribe(
          `/topic/notifications/${userEmail}`,
          (message: any) => {
            if (!message?.body) return;
            const newNotification = JSON.parse(message.body as string);
            console.log("📩 New notification received:", newNotification);

            // Add new notification instantly to the list
            setNotifications((prev) => [newNotification, ...prev]);
          }
        );
      },
      onStompError: (frame: any) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    setStompClient(client);

    // Cleanup when component unmounts
    return () => {
      try {
        client.deactivate();
        console.log("❌ Disconnected from WebSocket");
      } catch (e) {
        /* noop */
      }
    };
  }, [userEmail]);

  // 🔹 Mark one notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8083/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // 🔹 Click on a notification (load full details)
  const handleNotificationClick = async (id: number, status: string) => {
    try {
      if (status === "UNREAD") await handleMarkAsRead(id);
      const res = await fetch(
        `http://localhost:8083/api/notifications/detail/${id}`
      );
      const detail = await res.json();
      setSelectedNotification(detail);
    } catch (error) {
      console.error("Error fetching notification detail:", error);
    }
  };

  // 🔹 Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(
        `http://localhost:8083/api/notifications/mark-all-read?userEmail=${userEmail}`,
        {
          method: "PATCH",
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // 🔹 Delete notification
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await fetch(`http://localhost:8083/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotification?.id === id) setSelectedNotification(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // 🔹 Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // 🔹 Filter unread if checkbox checked
  const filteredNotifications = notifications.filter((n) =>
    showUnreadOnly ? n.status === "UNREAD" : true
  );
  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Notification List */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-semibold mb-1">Notifications</h1>
              <p className="text-gray-400 text-sm">
                {unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "You're all caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-sm transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-400">Unread only</span>
            </label>
          </div>

          {/* List */}
          {loading ? (
            <p className="text-gray-400 text-center">
              Loading notifications...
            </p>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.status)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedNotification?.id === n.id
                      ? "border-cyan-400 bg-cyan-500/10"
                      : n.status === "UNREAD"
                      ? "border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10"
                      : "border-gray-800 bg-gray-900 hover:bg-gray-850 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-semibold mb-1 ${
                          n.status === "UNREAD"
                            ? "text-cyan-400"
                            : "text-gray-200"
                        }`}
                      >
                        {n.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <p>{formatTimeAgo(n.createdAt)}</p>
                    {n.status === "UNREAD" && (
                      <span className="text-cyan-400 text-[11px] font-medium">
                        ● Unread
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔔
              </div>
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-gray-400 text-sm">
                You&apos;re all caught up! No new notifications to display.
              </p>
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="hidden lg:block">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
            {selectedNotification ? (
              <>
                <h2 className="text-2xl font-semibold text-cyan-400 mb-2">
                  {selectedNotification.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
                <hr className="border-gray-800 mb-4" />
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
                <div className="mt-6 flex justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedNotification.status === "READ"
                        ? "bg-gray-800 text-gray-400"
                        : "bg-cyan-600/20 text-cyan-400"
                    }`}
                  >
                    {selectedNotification.status}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-4xl mb-3">💬</div>
                <p>Select a notification to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
