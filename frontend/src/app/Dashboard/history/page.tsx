"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: GET /api/services/history

export default function ServiceHistoryPage() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('all');
    
    // Mock Data - Replace with backend API calls
    const [services] = useState([
        {
            id: "SRV-001",
            date: "2024-12-10",
            vehicle: "Ford F-150",
            vehicleId: 4,
            services: ["Full Service", "Tire Rotation", "Oil Change"],
            cost: 199.99,
            status: "COMPLETED",
            technician: "Mike Johnson",
            duration: "2h 30min",
            rating: 5,
            hasFeedback: true
        },
        {
            id: "SRV-002",
            date: "2024-12-05",
            vehicle: "BMW 3 Series",
            vehicleId: 5,
            services: ["AC Service", "Air Filter Replacement"],
            cost: 79.99,
            status: "COMPLETED",
            technician: "Sarah Williams",
            duration: "1h 15min",
            rating: 4,
            hasFeedback: true
        },
        {
            id: "SRV-003",
            date: "2024-11-28",
            vehicle: "Toyota Camry",
            vehicleId: 1,
            services: ["Oil Change", "Tire Pressure Check"],
            cost: 29.99,
            status: "COMPLETED",
            technician: "Mike Johnson",
            duration: "30min",
            rating: 5,
            hasFeedback: false
        },
        {
            id: "SRV-004",
            date: "2024-11-20",
            vehicle: "Honda Civic",
            vehicleId: 2,
            services: ["Brake Inspection", "Brake Pad Replacement"],
            cost: 149.99,
            status: "COMPLETED",
            technician: "John Smith",
            duration: "2h 0min",
            rating: 5,
            hasFeedback: true
        },
        {
            id: "SRV-005",
            date: "2024-11-10",
            vehicle: "Tesla Model 3",
            vehicleId: 3,
            services: ["Battery Check", "Charging Port Inspection"],
            cost: 99.99,
            status: "COMPLETED",
            technician: "Sarah Williams",
            duration: "1h 45min",
            rating: 4,
            hasFeedback: true
        },
        {
            id: "SRV-006",
            date: "2024-10-25",
            vehicle: "Ford F-150",
            vehicleId: 4,
            services: ["Routine Maintenance", "Fluid Top-ups"],
            cost: 59.99,
            status: "COMPLETED",
            technician: "Mike Johnson",
            duration: "45min",
            rating: 5,
            hasFeedback: false
        }
    ]);

    const handleViewDetails = (id: string) => {
        router.push(`/Dashboard/history/${id}`);
    };

    const handleLeaveFeedback = (id: string) => {
        router.push(`/Dashboard/history/${id}/feedback`);
    };

    const getStarRating = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
                ⭐
            </span>
        ));
    };

    const filters = [
        { id: 'all', label: 'All Services', count: services.length },
        { id: 'hasFeedback', label: 'With Feedback', count: services.filter(s => s.hasFeedback).length },
        { id: 'noFeedback', label: 'Without Feedback', count: services.filter(s => !s.hasFeedback).length }
    ];

    const filteredServices = selectedFilter === 'all' 
        ? services 
        : selectedFilter === 'hasFeedback'
        ? services.filter(s => s.hasFeedback)
        : services.filter(s => !s.hasFeedback);

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Service History</h1>
                        <p className="text-gray-400">View and manage your completed vehicle services</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-2">Total Services</p>
                        <p className="text-3xl font-bold text-white">{services.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-2">Total Spent</p>
                        <p className="text-3xl font-bold text-white">
                            ${services.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-2">Average Rating</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">
                                {(services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)}
                            </span>
                            <span className="text-2xl">⭐</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.id)}
                            className={`px-6 py-3 rounded-xl font-semibold text-sm transition ${
                                selectedFilter === filter.id
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                            }`}
                        >
                            {filter.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                selectedFilter === filter.id ? 'bg-white/20' : 'bg-gray-800'
                            }`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Services List */}
                {filteredServices.length > 0 ? (
                    <div className="space-y-4">
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-cyan-500/50 transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Date Column */}
                                            <div className="text-center min-w-[80px]">
                                                <p className="text-cyan-400 font-bold text-2xl mb-1">
                                                    {new Date(service.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                                </p>
                                                <p className="text-gray-400 text-xs">
                                                    {new Date(service.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </p>
                                            </div>

                                            {/* Vehicle Icon */}
                                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                                {service.vehicle.split(' ')[0].charAt(0)}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-lg mb-2">{service.vehicle}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    {service.services.map((svc, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-medium"
                                                        >
                                                            {svc}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {service.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                        </svg>
                                                        {service.technician}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side */}
                                        <div className="text-right">
                                            <p className="text-green-400 font-bold text-xl mb-2">${service.cost.toFixed(2)}</p>
                                            <div className="flex items-center gap-1 justify-end mb-2">
                                                {getStarRating(service.rating)}
                                            </div>
                                            {!service.hasFeedback && (
                                                <p className="text-yellow-400 text-xs">No feedback yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(service.id)}
                                                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                            {!service.hasFeedback && (
                                                <button
                                                    onClick={() => handleLeaveFeedback(service.id)}
                                                    className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition text-sm font-medium flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                    </svg>
                                                    Leave Feedback
                                                </button>
                                            )}
                                        </div>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                            ✅ Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No service history</h3>
                        <p className="text-gray-400 mb-6">Start booking services to view your history here</p>
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

