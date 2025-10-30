"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: GET /api/appointments/{id}

export default function AppointmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;
    
    // Mock Data - Replace with backend API call
    const [appointment] = useState({
        id: "APT-001",
        vehicle: {
            id: 1,
            make: "Toyota",
            model: "Camry",
            year: "2021",
            plate: "ABC-1234",
            color: "Silver"
        },
        service: {
            id: 1,
            name: "Oil Change",
            description: "Standard oil and filter change",
            duration: "30 min",
            price: "$29.99"
        },
        date: "2024-12-20",
        time: "10:00 AM",
        status: "SCHEDULED",
        employee: {
            id: 1,
            name: "Mike Johnson",
            phone: "+1 (555) 123-4567",
            email: "mike.johnson@autoflow.com"
        },
        notes: [
            "Customer requested synthetic oil",
            "Check tire pressure",
            "Window already open - no need to unlock"
        ],
        estimatedDuration: "30 min",
        actualDuration: null,
        totalCost: 29.99,
        createdAt: "2024-12-10T08:00:00",
        updatedAt: "2024-12-10T08:00:00"
    });

    const getStatusInfo = (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string; icon: string; description: string } } = {
            'SCHEDULED': { 
                color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', 
                text: 'Scheduled', 
                icon: '📅',
                description: 'Appointment is confirmed and scheduled'
            },
            'IN_PROGRESS': { 
                color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', 
                text: 'In Progress', 
                icon: '🔧',
                description: 'Service is currently being performed'
            },
            'AWAITING_PARTS': { 
                color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', 
                text: 'Awaiting Parts', 
                icon: '📦',
                description: 'Waiting for required parts to arrive'
            },
            'COMPLETED': { 
                color: 'bg-green-500/20 text-green-400 border-green-500/50', 
                text: 'Completed', 
                icon: '✅',
                description: 'Service has been completed'
            },
            'CANCELLED': { 
                color: 'bg-red-500/20 text-red-400 border-red-500/50', 
                text: 'Cancelled', 
                icon: '❌',
                description: 'Appointment has been cancelled'
            }
        };
        
        return statusConfig[status] || { 
            color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', 
            text: status, 
            icon: '📋',
            description: 'Unknown status'
        };
    };

    const statusInfo = getStatusInfo(appointment.status);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleCancel = () => {
        // Backend Integration: PATCH /api/appointments/{id}/cancel
        if (confirm('Are you sure you want to cancel this appointment?')) {
            alert(`Cancelling appointment ${appointmentId} - Backend integration needed`);
        }
    };

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
                        Back to Appointments
                    </button>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Appointment Details</h1>
                            <p className="text-gray-400">ID: {appointment.id}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${statusInfo.color} font-semibold`}>
                            <span className="text-xl">{statusInfo.icon}</span>
                            {statusInfo.text}
                        </div>
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Status Timeline</h2>
                    <div className="space-y-4">
                        {[
                            { status: 'SCHEDULED', label: 'Scheduled', icon: '📅', active: ['SCHEDULED', 'IN_PROGRESS', 'AWAITING_PARTS', 'COMPLETED'].includes(appointment.status) },
                            { status: 'IN_PROGRESS', label: 'In Progress', icon: '🔧', active: ['IN_PROGRESS', 'COMPLETED'].includes(appointment.status) },
                            { status: 'AWAITING_PARTS', label: 'Awaiting Parts', icon: '📦', active: ['AWAITING_PARTS', 'COMPLETED'].includes(appointment.status) },
                            { status: 'COMPLETED', label: 'Completed', icon: '✅', active: appointment.status === 'COMPLETED' }
                        ].map((step, index) => (
                            <div key={step.status} className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                    step.active
                                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                                        : 'bg-gray-800 text-gray-600'
                                }`}>
                                    {step.icon}
                                </div>
                                <div className="flex-1 pb-4 border-b border-gray-800">
                                    <p className={`font-semibold ${step.active ? 'text-white' : 'text-gray-500'}`}>
                                        {step.label}
                                    </p>
                                    {step.status === appointment.status && (
                                        <p className="text-gray-400 text-sm mt-1">{statusInfo.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Vehicle Info */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                            </svg>
                            Vehicle Information
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{appointment.vehicle.make} {appointment.vehicle.model}</p>
                            <p className="text-gray-400 text-sm">{appointment.vehicle.year} • {appointment.vehicle.plate}</p>
                            <p className="text-gray-400 text-sm">Color: {appointment.vehicle.color}</p>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 010-3.586L11.3 2.3a2.548 2.548 0 013.586 0l2.123 2.123M11.42 15.17l5.655-5.653" />
                            </svg>
                            Service Details
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{appointment.service.name}</p>
                            <p className="text-gray-400 text-sm">{appointment.service.description}</p>
                            <p className="text-cyan-400 font-medium text-sm">{appointment.estimatedDuration} • {appointment.service.price}</p>
                        </div>
                    </div>
                </div>

                {/* Date & Time & Employee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            Date & Time
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{formatDate(appointment.date)}</p>
                            <p className="text-cyan-400 font-bold text-lg">{appointment.time}</p>
                            <p className="text-gray-400 text-sm">Estimated Duration: {appointment.estimatedDuration}</p>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Assigned Technician
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{appointment.employee.name}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                {appointment.employee.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                {appointment.notes && appointment.notes.length > 0 && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A2.25 2.25 0 003.75 4.5v15A2.25 2.25 0 006 21.75h12A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0018 1.5H6z" />
                            </svg>
                            Notes & Updates
                        </h3>
                        <div className="space-y-2">
                            {appointment.notes.map((note, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                                    <span className="text-cyan-400">•</span>
                                    <p className="text-gray-300 text-sm">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {appointment.status === 'SCHEDULED' && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition font-semibold"
                        >
                            Cancel Appointment
                        </button>
                        <button
                            onClick={() => router.push('/Dashboard/appointments')}
                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
                        >
                            Back to Appointments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}



