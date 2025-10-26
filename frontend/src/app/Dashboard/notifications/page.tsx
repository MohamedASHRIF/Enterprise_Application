"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: 
// GET /api/notifications
// PATCH /api/notifications/{id}/read
// PATCH /api/notifications/mark-all-read
// DELETE /api/notifications/{id}

export default function NotificationsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    
    // Mock Data - Replace with backend API calls
    const [notifications, setNotifications] = useState([
        {
            id: "NTF-001",
            type: "APPOINTMENT_UPDATE",
            title: "Service Started",
            message: "Your Toyota Camry oil change service has started. Mike Johnson is working on your vehicle.",
            time: "2024-12-18T11:15:00",
            isRead: false,
            appointmentId: "APT-003",
            link: "/Dashboard/appointments/APT-003"
        },
        {
            id: "NTF-002",
            type: "APPOINTMENT_COMPLETED",
            title: "Service Completed",
            message: "Your Ford F-150 full service has been completed. Ready for pickup!",
            time: "2024-12-10T13:45:00",
            isRead: false,
            appointmentId: "APT-004",
            link: "/Dashboard/appointments/APT-004"
        },
        {
            id: "NTF-003",
            type: "APPOINTMENT_REMINDER",
            title: "Appointment Reminder",
            message: "You have an appointment tomorrow at 10:00 AM for your Toyota Camry.",
            time: "2024-12-19T08:00:00",
            isRead: true,
            appointmentId: "APT-001",
            link: "/Dashboard/appointments/APT-001"
        },
        {
            id: "NTF-004",
            type: "FEEDBACK_REQUEST",
            title: "Share Your Experience",
            message: "How was your recent service with Mike Johnson? Please rate and provide feedback.",
            time: "2024-12-10T14:00:00",
            isRead: true,
            appointmentId: "APT-004",
            link: "/Dashboard/appointments/APT-004/feedback"
        },
        {
            id: "NTF-005",
            type: "APPOINTMENT_UPDATE",
            title: "Parts Arrived",
            message: "The parts for your Tesla Model 3 brake inspection have arrived. Service will resume shortly.",
            time: "2024-12-18T12:30:00",
            isRead: true,
            appointmentId: "APT-003",
            link: "/Dashboard/appointments/APT-003"
        },
        {
            id: "NTF-006",
            type: "APPOINTMENT_CANCELLED",
            title: "Appointment Cancelled",
            message: "Your Honda Civic tire rotation has been cancelled. Please book a new appointment.",
            time: "2024-12-15T09:00:00",
            isRead: true,
            appointmentId: "APT-006",
            link: null
        },
        {
            id: "NTF-007",
            type: "APPOINTMENT_SCHEDULED",
            title: "Appointment Confirmed",
            message: "Your Honda Civic tire rotation has been scheduled for December 22 at 2:00 PM.",
            time: "2024-12-10T10:00:00",
            isRead: true,
            appointmentId: "APT-002",
            link: "/Dashboard/appointments/APT-002"
        },
        {
            id: "NTF-008",
            type: "SYSTEM_UPDATE",
            title: "New Services Available",
            message: "We've added new premium services! Check them out in our booking section.",
            time: "2024-12-08T12:00:00",
            isRead: true,
            link: "/Dashboard/book-service"
        },
        {
            id: "NTF-009",
            type: "EMPLOYEE_ASSIGNED",
            title: "Technician Assigned",
            message: "Sarah Williams has been assigned to your Honda Civic tire rotation appointment.",
            time: "2024-12-10T10:15:00",
            isRead: true,
            appointmentId: "APT-002",
            link: "/Dashboard/appointments/APT-002"
        }
    ]);

    // Real-time Updates Simulation
    // Backend Integration: Implement WebSocket or Polling
    // WebSocket: ws://localhost:8081/api/notifications/live
    // Polling: setInterval(() => fetchNotifications(), 30000) // Every 30 seconds
    
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulated real-time update
            console.log("Checking for new notifications...");
            // Backend Integration: Poll or listen to WebSocket
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: string) => {
        const iconMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
            'APPOINTMENT_SCHEDULED': { icon: '📅', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
            'APPOINTMENT_UPDATE': { icon: '🔄', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
            'APPOINTMENT_COMPLETED': { icon: '✅', color: 'text-green-400', bgColor: 'bg-green-500/20' },
            'APPOINTMENT_CANCELLED': { icon: '❌', color: 'text-red-400', bgColor: 'bg-red-500/20' },
            'APPOINTMENT_REMINDER': { icon: '⏰', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
            'EMPLOYEE_ASSIGNED': { icon: '👤', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
            'FEEDBACK_REQUEST': { icon: '⭐', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
            'SYSTEM_UPDATE': { icon: '🔔', color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
        };
        
        return iconMap[type] || { icon: '🔔', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    };

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
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleMarkAsRead = (id: string) => {
        // Backend Integration: PATCH /api/notifications/{id}/read
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const handleMarkAllRead = () => {
        // Backend Integration: PATCH /api/notifications/mark-all-read
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleDelete = (id: string) => {
        // Backend Integration: DELETE /api/notifications/{id}
        if (confirm('Delete this notification?')) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const handleNotificationClick = (notification: typeof notifications[0]) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (showUnreadOnly && n.isRead) return false;
        if (filter === 'all') return true;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filterOptions = [
        { id: 'all', label: 'All', count: notifications.length },
        { id: 'APPOINTMENT_SCHEDULED', label: 'Appointments', count: notifications.filter(n => n.type.includes('APPOINTMENT')).length },
        { id: 'FEEDBACK_REQUEST', label: 'Feedback', count: notifications.filter(n => n.type === 'FEEDBACK_REQUEST').length },
        { id: 'SYSTEM_UPDATE', label: 'System', count: notifications.filter(n => n.type === 'SYSTEM_UPDATE').length }
    ];

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                        <p className="text-gray-400">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition text-sm font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    <div className="flex gap-2 flex-1">
                        {filterOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setFilter(option.id)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                                    filter === option.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                                }`}
                            >
                                {option.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    filter === option.id ? 'bg-white/20' : 'bg-gray-800'
                                }`}>
                                    {option.count}
                                </span>
                            </button>
                        ))}
                    </div>
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

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                            const iconData = getNotificationIcon(notification.type);
                            
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`bg-gray-900 rounded-xl border transition p-4 cursor-pointer ${
                                        notification.isRead 
                                            ? 'border-gray-800 hover:border-gray-700' 
                                            : 'border-cyan-500/50 hover:border-cyan-500 bg-cyan-500/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconData.bgColor}`}>
                                            {iconData.icon}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className={`font-bold mb-1 ${
                                                        notification.isRead ? 'text-white' : 'text-cyan-400'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">{notification.message}</p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-gray-500 text-xs">{formatTimeAgo(notification.time)}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification.id);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-red-400"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m0 0L2.974 12m-2.605 6.324A12.074 12.074 0 015.121 19.12l12.803-12.801a12.074 12.074 0 013.712 0L12.864 4.111c-.442-1.757-1.365-3.028-3.056-3.028-1.767 0-3.13 1.16-3.543 2.903a3.505 3.505 0 00-1.047 3.553L8.56 12.06l-1.61 4.312-.838 2.277L15.26 9m-4.788-5.5L12.864 4.111c.442-1.757 1.365-3.028 3.056-3.028 1.767 0 3.13 1.16 3.543 2.903a3.505 3.505 0 001.047 3.553L12.06 12 15.26 9m0 0l3.544 3.544M12.06 12L8.56 8.5" />
                                                    </svg>
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
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No notifications</h3>
                        <p className="text-gray-400">You're all caught up! No new notifications to display.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

