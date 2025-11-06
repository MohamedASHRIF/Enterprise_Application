"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

interface Notification {
  id: number;
  title: string;
  message: string;
  status: "READ" | "UNREAD";
  type?: string;
  createdAt: string;
  isRead?: boolean;
  time?: string;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [stompClient, setStompClient] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserEmail(userData.email || null);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual notification API endpoint when available
      // const response = await customerApi.get('/api/notifications');
      // const notifications = response.data || [];
      // setNotifications(notifications.map((n: any) => ({
      //   ...n,
      //   status: n.isRead ? "READ" : "UNREAD",
      //   createdAt: n.createdAt || n.time
      // })));
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection (commented out until SockJS/Stomp libraries are installed)
  // useEffect(() => {
  //   if (!userEmail) return;
  //   
  //   // WebSocket setup would go here
  //   // const socket = new SockJS("http://localhost:8083/ws");
  //   // const client = Stomp.over(socket);
  //   // client.connect({}, () => {
  //   //   console.log("✅ Connected to WebSocket");
  //   //   // Subscribe to user's notification channel
  //   // });
  //   
  //   return () => {
  //     // Cleanup WebSocket connection
  //   };
  // }, [userEmail]);

  // Mark one notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8083/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" as const, isRead: true } : n))
      );
      if (selectedNotification?.id === id) {
        setSelectedNotification({ ...selectedNotification, status: "READ", isRead: true });
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      // TODO: Replace with actual API endpoint when available
      // await customerApi.patch('/api/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" as const, isRead: true })));
      if (selectedNotification) {
        setSelectedNotification({ ...selectedNotification, status: "READ", isRead: true });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this notification?')) {
      return;
    }
    
    try {
      // TODO: Replace with actual API endpoint when available
      // await customerApi.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Click on a notification (load full details)
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.status === "UNREAD") {
        await handleMarkAsRead(notification.id);
      }
      
      // Try to fetch full details from API
      try {
        const res = await fetch(`http://localhost:8083/api/notifications/detail/${notification.id}`);
        if (res.ok) {
          const detail = await res.json();
          setSelectedNotification(detail);
        } else {
          setSelectedNotification(notification);
        }
      } catch (error) {
        // If API fails, use the notification we already have
        setSelectedNotification(notification);
      }
      
      // Navigate if there's a link
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (showUnreadOnly && n.status === "READ") return false;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  // Format time ago
  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (error) {
      return "Just now";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string | undefined) => {
    const icons: Record<string, { icon: string; bgColor: string }> = {
      APPOINTMENT_CONFIRMED: { icon: "📅", bgColor: "bg-blue-500/20 text-blue-400" },
      STATUS_CHANGED: { icon: "🔄", bgColor: "bg-yellow-500/20 text-yellow-400" },
      REMINDER: { icon: "⏰", bgColor: "bg-purple-500/20 text-purple-400" },
    };
    return icons[type || "default"] || { icon: "🔔", bgColor: "bg-gray-500/20 text-gray-400" };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "All caught up!"}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Notifications List */}
          <div className="lg:col-span-2 space-y-4">
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
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="text-gray-400">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((n) => {
                  const iconData = getNotificationIcon(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedNotification?.id === n.id
                          ? "border-cyan-400 bg-cyan-500/10"
                          : n.status === "UNREAD"
                          ? "border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10"
                          : "border-gray-800 bg-gray-900 hover:bg-gray-850 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${iconData.bgColor}`}>
                          {iconData.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold mb-1 ${
                                  n.status === "UNREAD" ? "text-cyan-400" : "text-gray-200"
                                }`}
                              >
                                {n.title}
                              </h3>
                              <p className="text-gray-400 text-sm line-clamp-2">{n.message}</p>
                            </div>
                            {n.status === "UNREAD" && (
                              <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-500 text-xs">{formatTimeAgo(n.createdAt || n.time)}</p>
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
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full sticky top-4">
              {selectedNotification ? (
                <>
                  <h2 className="text-2xl font-semibold text-cyan-400 mb-2">
                    {selectedNotification.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {new Date(selectedNotification.createdAt || selectedNotification.time || Date.now()).toLocaleString()}
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
    </div>
  );
}
