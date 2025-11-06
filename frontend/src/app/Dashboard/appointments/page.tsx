"use client"
import { useState, useEffect } from "react";
import { getAppointmentsByCustomer, cancelAppointment } from '@/app/api/customerApi';
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: GET /api/appointments

export default function AppointmentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // Appointments state (loaded from backend)
    const [appointments, setAppointments] = useState<any>({ upcoming: [], inProgress: [], completed: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const stored = localStorage.getItem('user');
                if (!stored) return setAppointments({ upcoming: [], inProgress: [], completed: [] });
                const user = JSON.parse(stored);
                const customerId = user.id || user.userId || user.customerId;
                if (!customerId) return setAppointments({ upcoming: [], inProgress: [], completed: [] });

                const list = await getAppointmentsByCustomer(Number(customerId));
                const upcoming = (list || []).filter((a: any) => a.status === 'SCHEDULED');
                const inProgress = (list || []).filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PAUSED');
                const completed = (list || []).filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED');
                setAppointments({ upcoming, inProgress, completed });
            } catch (e) {
                console.error('Failed to load appointments', e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string; icon: string } } = {
            'SCHEDULED': { color: 'bg-blue-500/20 text-blue-400', text: 'Scheduled', icon: '📅' },
            'IN_PROGRESS': { color: 'bg-yellow-500/20 text-yellow-400', text: 'In Progress', icon: '🔧' },
            'COMPLETED': { color: 'bg-green-500/20 text-green-400', text: 'Completed', icon: '✅' },
            'CANCELLED': { color: 'bg-red-500/20 text-red-400', text: 'Cancelled', icon: '❌' },
            'AWAITING_PARTS': { color: 'bg-orange-500/20 text-orange-400', text: 'Awaiting Parts', icon: '📦' }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400', text: status, icon: '📋' };
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <span>{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const handleViewDetails = (id: string) => {
        router.push(`/Dashboard/appointments/${id}`);
    };

    const handleCancelAppointment = async (id: number | string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelAppointment(Number(id));
            // Refresh
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                const customerId = user.id || user.userId || user.customerId;
                if (customerId) {
                    const list = await getAppointmentsByCustomer(Number(customerId));
                    const upcoming = (list || []).filter((a: any) => a.status === 'SCHEDULED');
                    const inProgress = (list || []).filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PAUSED');
                    const completed = (list || []).filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED');
                    setAppointments({ upcoming, inProgress, completed });
                }
            }
            alert('Appointment cancelled');
        } catch (err) {
            console.error('Cancel failed', err);
            alert('Failed to cancel appointment');
        }
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', count: appointments.upcoming.length },
        { id: 'inProgress', label: 'In Progress', count: appointments.inProgress.length },
        { id: 'completed', label: 'Completed', count: appointments.completed.length }
    ];

    const displayAppointments = activeTab === 'upcoming' ? appointments.upcoming 
        : activeTab === 'inProgress' ? appointments.inProgress 
        : appointments.completed;

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
                        <p className="text-gray-400">Track and manage your vehicle services</p>
                    </div>
                    <button
                        onClick={() => router.push('/Dashboard/book-service')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Book Service
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-800">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold text-sm transition relative ${
                                activeTab === tab.id
                                    ? 'text-cyan-400'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.id
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'bg-gray-800 text-gray-500'
                            }`}>
                                {tab.count}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                {displayAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {displayAppointments.map((apt: any) => (
                            <div
                                key={apt.id}
                                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-cyan-500/50 transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Vehicle Icon */}
                                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                                {apt.vehicle.split(' ')[0].charAt(0)}
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-white font-bold text-lg">{apt.service}</h3>
                                                    {getStatusBadge(apt.status)}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-1">{apt.vehicle}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                        </svg>
                                                        {apt.date} at {apt.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.025 9.232 9.232 0 01-3.628.844 9.238 9.238 0 01-5.125-1.537 9.32 9.32 0 01-2.625-5.106v-.75M15 19.128l-3.433-.384a4.5 4.5 0 00-2.635-.4" />
                                                        </svg>
                                                        {apt.employee}
                                                    </span>
                                                    {apt.rating && (
                                                        <span className="flex items-center gap-1 text-yellow-400">
                                                            {Array(apt.rating).fill(0).map((_, i) => (
                                                                <span key={i}>⭐</span>
                                                            ))}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Price & Actions */}
                                        <div className="flex items-start gap-4">
                                            <div className="text-right">
                                                <p className="text-gray-400 text-xs">Cost</p>
                                                <p className="text-green-400 font-bold">{apt.price}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Estimated: {apt.estimatedDuration}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {apt.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => handleCancelAppointment(apt.id)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewDetails(apt.id)}
                                                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No {activeTab === 'upcoming' ? 'upcoming' : activeTab === 'inProgress' ? 'active' : 'completed'} appointments</h3>
                        <p className="text-gray-400 mb-6">Start by booking your first service</p>
                        <button
                            onClick={() => router.push('/Dashboard/book-service')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Book Service
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}



