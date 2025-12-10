"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getAppointmentsByCustomer, getVehicles } from "@/app/api/customerApi";

// Backend Integration: Replace with real API calls
// GET /api/appointments/upcoming
// GET /api/appointments/status-counts
// GET /api/vehicles

export default function Dashboard() {
    const [userName, setUserName] = useState('User');
    const [userId, setUserId] = useState<number | null>(null);
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        make: '',
        model: '',
        year: '',
        plate: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [statusCounts, setStatusCounts] = useState({
        scheduled: 0,
        inProgress: 0,
        completed: 0
    });
    const [vehicles, setVehicles] = useState<any[]>([]);

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

    const formatDisplayTime = (time?: string | null) => {
        if (!time) return 'Time TBD';
        const str = String(time);
        if (str.toLowerCase().includes('am') || str.toLowerCase().includes('pm')) return str;
        const [hStr, mStr] = str.split(':');
        const hour = Number(hStr);
        if (Number.isNaN(hour)) return str;
        const minutes = mStr ? mStr.substring(0, 2) : '00';
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const normaliseAppointment = (apt: any) => {
        const service = apt?.service || apt?.serviceDetails || apt?.serviceInfo || null;
        const vehicle = apt?.vehicle || apt?.vehicleDetails || apt?.vehicleInfo || null;
        const statusRaw = (apt?.status || apt?.appointmentStatus || apt?.currentStatus || 'SCHEDULED').toString().toUpperCase();
        const appointmentDate = apt?.appointmentDate || apt?.scheduledDate || apt?.date || null;
        const appointmentTime = apt?.appointmentTime || apt?.scheduledTime || apt?.time || null;
        const employeeName = apt?.employeeName || apt?.employee || apt?.assignedEmployee || 'Not assigned yet';

        const dateObj = parseDatePreserveLocal(appointmentDate);

        return {
            ...apt,
            service,
            vehicle,
            status: statusRaw,
            dateLabel: dateObj
                ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Date TBD',
            timeLabel: formatDisplayTime(appointmentTime),
            employee: employeeName
        };
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            window.location.href = '/';
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            const role = userData.role || 'CUSTOMER';

            if (role === 'EMPLOYEE') {
                window.location.href = '/Dashboard/employee';
                return;
            }

            const name = userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData.email || 'User';
            setUserName(name);

            const id = userData.id || userData.userId || userData.customerId;
            if (!id) {
                console.warn('Unable to resolve customer id from user payload');
                setIsLoading(false);
                return;
            }
            setUserId(id);

            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [appointments, vehicleList] = await Promise.all([
                        getAppointmentsByCustomer(Number(id)),
                        getVehicles(Number(id))
                    ]);

                    const normalized = (appointments || []).map(normaliseAppointment);
                    const scheduled = normalized.filter((a: any) => a.status === 'SCHEDULED');
                    const inProgress = normalized.filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PAUSED');
                    const completed = normalized.filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

                    const upcoming = [...scheduled]
                        .sort((a, b) => {
                            const da = parseDatePreserveLocal(a.appointmentDate || a.date) ?? new Date(a.createdAt || 0);
                            const db = parseDatePreserveLocal(b.appointmentDate || b.date) ?? new Date(b.createdAt || 0);
                            return da.getTime() - db.getTime();
                        })
                        .slice(0, 3);

                    setUpcomingAppointments(upcoming);
                    setStatusCounts({
                        scheduled: scheduled.length,
                        inProgress: inProgress.length,
                        completed: completed.length
                    });
                    setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
                } catch (err) {
                    console.error('Failed to load dashboard data', err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        } catch (error) {
            console.error('Error parsing user data:', error);
            setUserName('User');
            setIsLoading(false);
        }
    }, []);

    const handleAddVehicle = () => {
        alert('Vehicle creation is managed via the vehicles page in this build.');
        setShowAddVehicleModal(false);
        setNewVehicle({ make: '', model: '', year: '', plate: '' });
    };

    const vehicleLabelFor = (vehicle: any) => {
        if (!vehicle) return 'Unknown Vehicle';
        if (typeof vehicle === 'string') return vehicle;
        if (vehicle.make) return `${vehicle.make} ${vehicle.model || ''}`.trim();
        return vehicle.name || vehicle.plate || `Vehicle ${vehicle.id || ''}`;
    };

    const vehicleInitialFor = (vehicle: any) => {
        const label = vehicleLabelFor(vehicle);
        return label && label.length > 0 ? label.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {userName}!</h1>
                    <p className="text-gray-400">Monitor your vehicle services in real-time</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Scheduled</p>
                                <p className="text-3xl font-bold text-white mt-2">{statusCounts.scheduled}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3b82f6" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">In Progress</p>
                                <p className="text-3xl font-bold text-white mt-2">{statusCounts.inProgress}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#eab308" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Completed</p>
                                <p className="text-3xl font-bold text-white mt-2">{statusCounts.completed}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#22c55e" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.08a7.5 7.5 0 01-1.43 4.338m5.222 0a7.497 7.497 0 00.572-.24.25.25 0 00-.035-.075L15.75 12.5a.75.75 0 00-1.062-1.062L12.47 14.47l-1.453-1.453a.75.75 0 00-1.062 1.062l2 2a.75.75 0 001.063 0l4-4A7.5 7.5 0 0121 12z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">My Vehicles</p>
                                <p className="text-3xl font-bold text-white mt-2">{vehicles.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a855f7" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Appointments */}
                    <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
                            <a href="/Dashboard/appointments" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                View All →
                            </a>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12 text-gray-400">
                                Loading upcoming appointments...
                            </div>
                        ) : upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                                        {apt.status}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">#{apt.id}</span>
                                                </div>
                                                <h3 className="text-white font-semibold mb-1">{typeof apt.service === 'string' ? apt.service : apt.service?.name || 'Service'}</h3>
                                                <p className="text-gray-400 text-sm">{vehicleLabelFor(apt.vehicle)}</p>
                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                    </svg>
                                                    <span>{apt.dateLabel} at {apt.timeLabel}</span>
                                                </div>
                                                <p className="text-cyan-400 text-sm mt-1">Assigned: {apt.employee}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                No upcoming appointments. Book your next service to see it here.
                            </div>
                        )}

                        <a href="/Dashboard/book-service" className="mt-4 block text-center py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition">
                            Book New Service
                        </a>
                    </div>

                    {/* My Vehicles & Quick Actions */}
                    <div className="space-y-6">
                        {/* My Vehicles */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">My Vehicles</h2>
                                <a href="/Dashboard/vehicles" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                    Manage →
                                </a>
                            </div>

                            <div className="space-y-3">
                                {vehicles.length > 0 ? vehicles.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                                                {vehicleInitialFor(vehicle)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{vehicleLabelFor(vehicle)}</p>
                                                <p className="text-gray-400 text-sm">{vehicle.year || ''} {vehicle.plate ? `• ${vehicle.plate}` : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-sm">No vehicles found. Add a vehicle to book services faster.</p>
                                )}
                            </div>

                            <button 
                                onClick={() => setShowAddVehicleModal(true)}
                                className="mt-4 w-full py-2 border-2 border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-lg transition font-medium"
                            >
                                + Add Vehicle
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <a href="/Dashboard/book-service" className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </div>
        <div>
                                            <p className="text-white font-medium">Book Service</p>
                                            <p className="text-gray-400 text-sm">Schedule an appointment</p>
                                        </div>
        </div>
                                </a>

                                <a href="/Dashboard/appointments" className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H77.25z" />
                                            </svg>
                                        </div>
        <div>
                                            <p className="text-white font-medium">My Appointments</p>
                                            <p className="text-gray-400 text-sm">View all bookings</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {showAddVehicleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                            <button 
                                onClick={() => setShowAddVehicleModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Vehicle management is handled in the dedicated Vehicles section. Please use the Manage link above to add or edit vehicles.
                        </p>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowAddVehicleModal(false)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
