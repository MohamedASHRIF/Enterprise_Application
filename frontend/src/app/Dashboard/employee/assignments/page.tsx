"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

interface Assignment {
    id: string;
    customerName: string;
    vehicle: string;
    service: string;
    status: string;
    assignedDate: string;
    priority: string;
}

export default function EmployeeAssignments() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [userName, setUserName] = useState('Employee');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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

            // Only allow EMPLOYEE users
            if (role !== 'EMPLOYEE') {
                alert('Access Denied. Only employees can access this page.');
                window.location.href = '/Dashboard';
                return;
            }

            const name = userData.firstName && userData.lastName 
                ? `${userData.firstName} ${userData.lastName}` 
                : userData.email || 'Employee';
            setUserName(name);

            // Mock assignments data
            const mockAssignments: Assignment[] = [
                {
                    id: "APT-001",
                    customerName: "John Smith",
                    vehicle: "Toyota Camry 2021",
                    service: "Oil Change & Tire Rotation",
                    status: "In Progress",
                    assignedDate: "2024-12-20",
                    priority: "High"
                },
                {
                    id: "APT-002",
                    customerName: "Jane Doe",
                    vehicle: "Honda Civic 2020",
                    service: "Brake Inspection",
                    status: "Scheduled",
                    assignedDate: "2024-12-22",
                    priority: "Medium"
                }
            ];
            setAssignments(mockAssignments);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // Handler functions
    const handleStartWork = (assignment: Assignment) => {
        if (assignment.status === 'Scheduled') {
            const updatedAssignments = assignments.map(a => 
                a.id === assignment.id ? { ...a, status: 'In Progress' } : a
            );
            setAssignments(updatedAssignments);
            alert(`Started work on: ${assignment.service}`);
        } else {
            alert('This assignment is already in progress or completed.');
        }
    };

    const handleViewDetails = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowStatusModal(true);
    };

    const handleStatusChange = (newStatus: string) => {
        if (selectedAssignment) {
            const updatedAssignments = assignments.map(a => 
                a.id === selectedAssignment.id ? { ...a, status: newStatus } : a
            );
            setAssignments(updatedAssignments);
            setShowStatusModal(false);
            setSelectedAssignment(null);
            alert(`Status updated to: ${newStatus}`);
        }
    };

    // Show loading or nothing while checking authentication
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
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Assignments</h1>
                    <p className="text-gray-400">View and manage your assigned services</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Assignments</p>
                        <p className="text-3xl font-bold text-white mt-2">{assignments.length}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">In Progress</p>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">
                            {assignments.filter(a => a.status === 'In Progress').length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Scheduled</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {assignments.filter(a => a.status === 'Scheduled').length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Completed Today</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">0</p>
                    </div>
                </div>

                {/* Assignments List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Active Assignments</h2>
                    
                    {assignments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No assignments yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500/50 transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-white font-semibold text-lg mb-1">{assignment.service}</h3>
                                            <p className="text-gray-400 text-sm">Assignment ID: {assignment.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {assignment.status === 'In Progress' && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                                                    In Progress
                                                </span>
                                            )}
                                            {assignment.status === 'Scheduled' && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                    Scheduled
                                                </span>
                                            )}
                                            {assignment.priority === 'High' && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
                                                    High Priority
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">Customer</p>
                                            <p className="text-white font-medium">{assignment.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                                            <p className="text-white font-medium">{assignment.vehicle}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">Assigned Date</p>
                                            <p className="text-white font-medium">{assignment.assignedDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                                        <button 
                                            onClick={() => handleStartWork(assignment)}
                                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition text-sm"
                                        >
                                            Start Work
                                        </button>
                                        <button 
                                            onClick={() => handleViewDetails(assignment)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(assignment)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Assignment Details</h2>
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
                                    <p className="text-gray-400 text-sm mb-1">Assignment ID</p>
                                    <p className="text-white font-semibold">{selectedAssignment.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Status</p>
                                    <p className="text-white font-semibold">{selectedAssignment.status}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Service</p>
                                <p className="text-white font-semibold">{selectedAssignment.service}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Customer</p>
                                    <p className="text-white font-semibold">{selectedAssignment.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                                    <p className="text-white font-semibold">{selectedAssignment.vehicle}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Assigned Date</p>
                                <p className="text-white font-semibold">{selectedAssignment.assignedDate}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Priority</p>
                                <p className="text-white font-semibold">{selectedAssignment.priority}</p>
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

            {/* Status Update Modal */}
            {showStatusModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Update Status</h2>
                            <button 
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-400 mb-2">Assignment: <span className="text-white">{selectedAssignment.service}</span></p>
                            <p className="text-gray-400">Current Status: <span className="text-white">{selectedAssignment.status}</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button 
                                onClick={() => handleStatusChange('Scheduled')}
                                className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50 rounded-lg transition font-semibold"
                            >
                                Scheduled
                            </button>
                            <button 
                                onClick={() => handleStatusChange('In Progress')}
                                className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 rounded-lg transition font-semibold"
                            >
                                In Progress
                            </button>
                            <button 
                                onClick={() => handleStatusChange('Awaiting Parts')}
                                className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/50 rounded-lg transition font-semibold"
                            >
                                Awaiting Parts
                            </button>
                            <button 
                                onClick={() => handleStatusChange('Completed')}
                                className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 rounded-lg transition font-semibold"
                            >
                                Completed
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowStatusModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
