"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

interface ScheduledTask {
    id: string;
    customerName: string;
    vehicle: string;
    service: string;
    time: string;
    status: string;
    duration: string;
    startTimestamp?: number; // epoch ms when work started
    endTimestamp?: number;   // epoch ms when work finished
}

export default function EmployeeSchedule() {
    const [schedule, setSchedule] = useState<{ [key: string]: ScheduledTask[] }>({});
    const [userRole, setUserRole] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [tick, setTick] = useState(0); // updates every second to drive live timers

    useEffect(() => {
        // Check if user is authenticated and has EMPLOYEE role
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!storedUser || !storedToken) {
            alert('Please log in to access this page.');
            window.location.href = '/';
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            const role = userData.role || 'CUSTOMER';
            setUserRole(role);

            if (role !== 'EMPLOYEE') {
                alert('Access Denied. Only employees can access this page.');
                window.location.href = '/Dashboard';
                return;
            }

            // Mock schedule data
            const mockSchedule: { [key: string]: ScheduledTask[] } = {
                'Monday': [
                    {
                        id: "APT-001",
                        customerName: "John Smith",
                        vehicle: "Toyota Camry",
                        service: "Oil Change",
                        time: "09:00 AM",
                        status: "Scheduled",
                        duration: "45 min"
                    },
                    {
                        id: "APT-002",
                        customerName: "Sarah Johnson",
                        vehicle: "Honda Civic",
                        service: "Tire Rotation",
                        time: "02:00 PM",
                        status: "Scheduled",
                        duration: "30 min"
                    }
                ],
                'Tuesday': [
                    {
                        id: "APT-003",
                        customerName: "Mike Brown",
                        vehicle: "Ford F-150",
                        service: "Brake Inspection",
                        time: "10:00 AM",
                        status: "Scheduled",
                        duration: "60 min"
                    }
                ],
                'Wednesday': [],
                'Thursday': [
                    {
                        id: "APT-004",
                        customerName: "Emily Davis",
                        vehicle: "BMW X5",
                        service: "Engine Diagnostic",
                        time: "11:00 AM",
                        status: "Scheduled",
                        duration: "90 min"
                    }
                ],
                'Friday': [],
                'Saturday': [],
                'Sunday': []
            };
            
            setSchedule(mockSchedule);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // 1-second ticker for live timers
    useEffect(() => {
        const intervalId = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const getTotalTime = (tasks: ScheduledTask[]) => {
        return tasks.reduce((total, task) => {
            const duration = parseInt(task.duration.split(' ')[0]);
            return total + duration;
        }, 0);
    };

    const handleStartWork = (task: ScheduledTask) => {
        if (task.status === 'Scheduled') {
            const now = Date.now();
            const updatedSchedule = { ...schedule };
            for (const day in updatedSchedule) {
                updatedSchedule[day] = updatedSchedule[day].map(t => 
                    t.id === task.id 
                        ? { ...t, status: 'In Progress', startTimestamp: now, endTimestamp: undefined } 
                        : t
                );
            }
            setSchedule(updatedSchedule);
        } else {
            alert('This appointment is already in progress or completed.');
        }
    };

    const handleFinishWork = (task: ScheduledTask) => {
        if (task.status === 'In Progress') {
            const now = Date.now();
            const updatedSchedule = { ...schedule };
            for (const day in updatedSchedule) {
                updatedSchedule[day] = updatedSchedule[day].map(t => 
                    t.id === task.id 
                        ? { ...t, status: 'Completed', endTimestamp: now } 
                        : t
                );
            }
            setSchedule(updatedSchedule);
        } else {
            alert('You can only finish tasks that are In Progress.');
        }
    };

    const handleViewDetails = (task: ScheduledTask) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
    };

    const formatTime = (ts?: number) => {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatElapsed = (startTs?: number, endTs?: number) => {
        if (!startTs) return '00:00:00';
        const end = endTs ?? Date.now();
        const totalSec = Math.max(0, Math.floor((end - startTs) / 1000));
        const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const ss = String(totalSec % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    };

    if (!userRole) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Checking permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            {/* Hidden binding to satisfy linter: ensures tick is used while remaining invisible */}
            <span className="hidden" aria-hidden>{tick}</span>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Schedule</h1>
                    <p className="text-gray-400">View your weekly schedule and appointments</p>
                </div>

                {/* Weekly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Appointments</p>
                        <p className="text-3xl font-bold text-white mt-2">
                            {Object.values(schedule).flat().length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">This Week</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {Object.values(schedule).flat().length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Time</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">
                            {getTotalTime(Object.values(schedule).flat())} hrs
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Available Hours</p>
                        <p className="text-3xl font-bold text-purple-500 mt-2">40h</p>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{day}</h2>
                                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold">
                                        {schedule[day]?.length || 0} appointments
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {!schedule[day] || schedule[day].length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 opacity-50">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        <p>No appointments scheduled for {day}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {schedule[day].map((task) => (
                                            <div key={task.id} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-cyan-500/50 transition">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                                {task.time.split(' ')[0].split(':')[0]}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-white font-semibold text-lg">{task.service}</h3>
                                                                <p className="text-gray-400 text-sm">{task.customerName} • {task.vehicle}</p>
                                                            </div>
                                                        </div>
                                                        {/* Timing */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-3">
                                                            <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                                                                <p className="text-gray-400">Start</p>
                                                                <p className="text-white font-medium">{formatTime(task.startTimestamp)}</p>
                                                            </div>
                                                            <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                                                                <p className="text-gray-400">End</p>
                                                                <p className="text-white font-medium">{formatTime(task.endTimestamp)}</p>
                                                            </div>
                                                            <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                                                                <p className="text-gray-400">Elapsed</p>
                                                                <p className="text-white font-medium">{formatElapsed(task.startTimestamp, task.endTimestamp)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-gray-400 text-sm">Duration</p>
                                                            <p className="text-white font-semibold">{task.duration}</p>
                                                        </div>
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    {task.status === 'In Progress' ? (
                                                        <button 
                                                            onClick={() => handleFinishWork(task)}
                                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition text-sm"
                                                        >
                                                            Finish Work
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleStartWork(task)}
                                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition text-sm"
                                                        >
                                                            Start Work
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleViewDetails(task)}
                                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Appointment ID</p>
                                    <p className="text-white font-semibold">{selectedTask.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Status</p>
                                    <p className="text-white font-semibold">{selectedTask.status}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Service</p>
                                <p className="text-white font-semibold">{selectedTask.service}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Customer</p>
                                    <p className="text-white font-semibold">{selectedTask.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                                    <p className="text-white font-semibold">{selectedTask.vehicle}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Scheduled</p>
                                    <p className="text-white font-semibold">{selectedTask.time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Start</p>
                                    <p className="text-white font-semibold">{formatTime(selectedTask.startTimestamp)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">End</p>
                                    <p className="text-white font-semibold">{formatTime(selectedTask.endTimestamp)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Elapsed</p>
                                <p className="text-white font-semibold">{formatElapsed(selectedTask.startTimestamp, selectedTask.endTimestamp)}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
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
