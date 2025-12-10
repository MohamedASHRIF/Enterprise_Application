"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAppointmentsByCustomer } from "@/app/api/customerApi";

interface HistoryItem {
    id: string;
    date: string;
    vehicle: any;
    services: string[];
    cost: number | null;
    status: string;
    technician: string;
    duration: string;
    rating: number | null;
    hasFeedback: boolean;
}

export default function ServiceHistoryPage() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [services, setServices] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const parseDatePreserveLocal = (input?: string | Date | null): Date | null => {
        if (!input) return null;
        if (input instanceof Date) return new Date(input.getFullYear(), input.getMonth(), input.getDate());
        const str = String(input);
        if (!str) return null;
        const [datePart] = str.split('T');
        const parts = datePart.split('-');
        if (parts.length >= 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const day = Number(parts[2].substring(0, 2));
            if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
                return new Date(year, month, day);
            }
        }
        const fallback = new Date(str);
        return Number.isNaN(fallback.getTime()) ? null : new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
    };

    const vehicleLabelFor = (vehicle: any) => {
        if (typeof vehicle === 'string') return vehicle;
        if (!vehicle) return 'Unknown Vehicle';
        if (vehicle.make) return `${vehicle.make} ${vehicle.model || ''}`.trim();
        if (vehicle.name) return vehicle.name;
        if (vehicle.plate) return vehicle.plate;
        return `Vehicle ${vehicle.id ?? ''}`;
    };

    const vehicleInitialFor = (vehicle: any) => {
        const label = vehicleLabelFor(vehicle);
        return label && label.length > 0 ? label.charAt(0).toUpperCase() : '?';
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            window.location.href = '/';
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            const customerId = user.id || user.userId || user.customerId;
            if (!customerId) {
                console.warn('Unable to resolve customer id for history page');
                setIsLoading(false);
                return;
            }

            const load = async () => {
                setIsLoading(true);
                try {
                    const appointments = await getAppointmentsByCustomer(Number(customerId));
                    const completed = (appointments || []).filter((apt: any) => {
                        const status = (apt?.status || apt?.appointmentStatus || '').toString().toUpperCase();
                        return ['COMPLETED', 'CANCELLED', 'CANCELLED_BY_CUSTOMER'].includes(status);
                    });

                    const mapped: HistoryItem[] = completed.map((apt: any) => {
                        const service = apt?.service || apt?.serviceDetails || apt?.serviceInfo || {};
                        const duration = service?.duration
                            ? `${service.duration}${typeof service.duration === 'number' ? ' min' : ''}`
                            : 'Duration N/A';
                        const price = service?.price ?? apt?.price ?? null;
                        const parsedDate = parseDatePreserveLocal(apt?.appointmentDate || apt?.date || apt?.createdAt);
                        const dateLabel = parsedDate
                            ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Date TBD';
                        const technician = apt?.employeeName || apt?.assignedEmployee || 'Technician TBA';
                        const serviceName = service?.name || apt?.serviceName || 'Service';

                        const generatedId = apt.id ? String(apt.id) : `APT-${Math.random().toString(36).slice(2, 10)}`;

                        return {
                            id: generatedId,
                            date: dateLabel,
                            vehicle: apt?.vehicle || apt?.vehicleDetails || apt?.vehicleInfo || null,
                            services: Array.isArray(apt?.services)
                                ? apt.services
                                : [serviceName],
                            cost: typeof price === 'number' ? price : Number(price) || null,
                            status: (apt?.status || apt?.appointmentStatus || 'COMPLETED').toString().toUpperCase(),
                            technician,
                            duration,
                            rating: apt?.feedback?.rating ?? null,
                            hasFeedback: Boolean(apt?.feedback)
                        };
                    });

                    setServices(mapped);
                } catch (err) {
                    console.error('Failed to load service history', err);
                    setServices([]);
                } finally {
                    setIsLoading(false);
                }
            };

            load();
        } catch (error) {
            console.error('Error parsing user data for history page', error);
            setIsLoading(false);
        }
    }, []);

    const handleViewDetails = (id: string) => {
        router.push(`/Dashboard/history/${id}`);
    };

    const handleLeaveFeedback = (id: string) => {
        router.push(`/Dashboard/history/${id}/feedback`);
    };

    const getStarRating = (rating: number | null) => {
        const safe = Math.max(0, Math.min(5, rating ?? 0));
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < safe ? 'text-yellow-400' : 'text-gray-600'}>
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
                            ${services.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-2">Average Rating</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">
                                {services.length > 0
                                    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
                                    : '0.0'}
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
                {isLoading ? (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center text-gray-400">
                        Loading service history...
                    </div>
                ) : filteredServices.length > 0 ? (
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
                                            <p className="text-green-400 font-bold text-xl mb-2">
                                                {service.cost !== null ? `$${service.cost.toFixed(2)}` : 'Cost N/A'}
                                            </p>
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
                                            ✅ {service.status}
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
                        <p className="text-gray-400 mb-6">Book and complete services to see them listed here.</p>
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



