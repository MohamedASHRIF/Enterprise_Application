"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

export default function ServiceDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true);
                const response = await customerApi.get(`/api/appointments/${serviceId}`);
                const apt = response.data;
                
                // Transform appointment data to service history format
                setService({
                    id: apt.id?.toString() || serviceId,
                    date: apt.appointmentDate || apt.date || '',
                    vehicle: apt.vehicle || { make: '', model: '', year: '', plate: '', color: '' },
                    services: [{
                        name: apt.service?.name || 'Service',
                        description: apt.service?.description || '',
                        price: apt.totalCost || 0
                    }],
                    cost: apt.totalCost || 0,
                    status: apt.status || 'COMPLETED',
                    technician: apt.employee || { name: 'TBD', phone: '', email: '' },
                    duration: apt.actualDuration ? `${apt.actualDuration} min` : apt.estimatedDuration || 'N/A',
                    completedAt: apt.updatedAt || apt.createdAt || '',
                    notes: apt.notes || [],
                    partsUsed: [],
                    beforePhotos: 0,
                    afterPhotos: 0,
                    nextServiceReminder: '',
                    rating: apt.rating || null,
                    feedback: apt.feedback || null
                });
            } catch (error) {
                console.error('Error fetching service details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchServiceDetails();
        }
    }, [serviceId]);

    const getStarRating = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-400 text-2xl' : 'text-gray-600 text-2xl'}>
                ⭐
            </span>
        ));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-gray-400 text-center py-12">Loading service details...</div>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-gray-400 text-center py-12">Service not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to History
                    </button>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Service Details</h1>
                            <p className="text-gray-400">ID: {service.id}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 font-semibold">
                            <span>✅</span>
                            Completed
                        </div>
                    </div>
                </div>

                {/* Service Date & Cost */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Service Date</h3>
                            <p className="text-white text-xl font-bold">{formatDate(service.date)}</p>
                            <p className="text-cyan-400 text-sm">{service.duration}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Cost</h3>
                            <p className="text-white text-xl font-bold">${service.cost.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">Completed on {formatDate(service.completedAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle & Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Vehicle Info */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                            </svg>
                            Vehicle
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold text-xl">{service.vehicle.make} {service.vehicle.model}</p>
                            <p className="text-gray-400 text-sm">{service.vehicle.year} • {service.vehicle.plate}</p>
                            <p className="text-gray-400 text-sm">Color: {service.vehicle.color}</p>
                        </div>
                    </div>

                    {/* Technician Info */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Technician
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{service.technician.name}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                {service.technician.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Performed */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Services Performed</h3>
                    <div className="space-y-3">
                        {service.services.map((svc, idx) => (
                            <div key={idx} className="flex items-start justify-between p-4 bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-white font-semibold">{svc.name}</p>
                                    <p className="text-gray-400 text-sm">{svc.description}</p>
                                </div>
                                <p className="text-cyan-400 font-bold">${svc.price.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parts Used */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Parts Used</h3>
                    <div className="space-y-3">
                        {service.partsUsed.map((part, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">{part.name}</p>
                                    <p className="text-gray-400 text-sm">Quantity: {part.quantity}</p>
                                </div>
                                <p className="text-gray-400">${(part.quantity * part.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technician Notes */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A2.25 2.25 0 003.75 4.5v15A2.25 2.25 0 006 21.75h12A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0018 1.5H6z" />
                        </svg>
                        Technician Notes
                    </h3>
                    <div className="space-y-2">
                        {service.notes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                                <span className="text-cyan-400 mt-1">•</span>
                                <p className="text-gray-300 text-sm">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback & Rating */}
                {service.feedback && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                            Your Feedback
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                            {getStarRating(service.rating)}
                        </div>
                        <p className="text-white">{service.feedback}</p>
                    </div>
                )}


                {/* Photos Placeholder */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500 mx-auto mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75c0 2.25.75 4.5 2.25 6.25 1.5 1.5 3.25 2.25 5.25 2.25 2.25 0 4.5-.75 6.25-2.25 1.5-1.5 2.25-3.25 2.25-5.25 0-2.25-.75-4.5-2.25-6.25-1.5-1.5-3.25-2.25-5.25-2.25-2.25 0-4.5.75-6.25 2.25-1.5 1.5-2.25 3.25-2.25 5.25zM9 16.5h.008v.008H9V16.5z" />
                        </svg>
                        <p className="text-gray-400 text-sm">Before: {service.beforePhotos} photos</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500 mx-auto mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75c0 2.25.75 4.5 2.25 6.25 1.5 1.5 3.25 2.25 5.25 2.25 2.25 0 4.5-.75 6.25-2.25 1.5-1.5 2.25-3.25 2.25-5.25 0-2.25-.75-4.5-2.25-6.25-1.5-1.5-3.25-2.25-5.25-2.25-2.25 0-4.5.75-6.25 2.25-1.5 1.5-2.25 3.25-2.25 5.25zM9 16.5h.008v.008H9V16.5z" />
                        </svg>
                        <p className="text-gray-400 text-sm">After: {service.afterPhotos} photos</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/Dashboard/history')}
                        className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition font-semibold"
                    >
                        Back to History
                    </button>
                </div>
            </div>
        </div>
    );
}




