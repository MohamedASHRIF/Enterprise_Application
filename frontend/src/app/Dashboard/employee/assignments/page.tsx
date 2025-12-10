"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    getEmployeeAssignments, 
    updateAssignmentStatus, 
    startTimeLog,
    getTimeLogsForAssignment,
    enrichAssignmentsWithDetails,
    type AssignmentResponse,
    type TimeLogResponse
} from "@/app/api/employeeApi";

interface Assignment {
    id: string;
    customerName: string;
    vehicle: string;
    service: string;
    status: string;
    assignedDate: string;
    priority: string;
    assignmentId?: number; // Backend assignment ID
    appointmentId?: number; // Backend appointment ID
}

export default function EmployeeAssignments() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [userName, setUserName] = useState('Employee');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLogs, setTimeLogs] = useState<TimeLogResponse[]>([]);
    const [loadingTimeLogs, setLoadingTimeLogs] = useState(false);

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
            
            // Get employee ID from user data
            const employeeId = userData.id || userData.userId;
            if (!employeeId) {
                alert('Employee ID not found. Please log in again.');
                window.location.href = '/';
                return;
            }
            setUserId(employeeId);

            // Fetch assignments from backend
            fetchAssignments(employeeId);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // Fetch assignments from backend
    const fetchAssignments = async (employeeId: number) => {
        try {
            setIsLoading(true);
            const assignmentsData = await getEmployeeAssignments(employeeId);
            const enrichedAssignments = await enrichAssignmentsWithDetails(assignmentsData);
            setAssignments(enrichedAssignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            alert('Failed to load assignments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler functions
    const handleStartWork = async (assignment: Assignment) => {
        if (!assignment.assignmentId) {
            alert('Assignment ID not found.');
            return;
        }

        // Check if status allows starting work
        if (assignment.status !== 'ASSIGNED' && assignment.status !== 'Scheduled') {
            alert('This assignment cannot be started. Current status: ' + assignment.status);
            return;
        }

        try {
            // Start time log
            await startTimeLog(assignment.assignmentId, `Started work on ${assignment.service}`);
            
            // Update assignment status to IN_PROGRESS
            await updateAssignmentStatus(assignment.assignmentId, 'IN_PROGRESS');
            
            // Refresh assignments
            if (userId) {
                await fetchAssignments(userId);
            }
            
            alert(`Started work on: ${assignment.service}`);
        } catch (error) {
            console.error('Error starting work:', error);
            alert('Failed to start work. Please try again.');
        }
    };

    const handleViewDetails = async (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
        
        // Fetch time logs for this assignment
        if (assignment.assignmentId) {
            try {
                setLoadingTimeLogs(true);
                const logs = await getTimeLogsForAssignment(assignment.assignmentId);
                setTimeLogs(logs);
            } catch (error) {
                console.error('Error fetching time logs:', error);
                setTimeLogs([]);
            } finally {
                setLoadingTimeLogs(false);
            }
        } else {
            setTimeLogs([]);
        }
    };

    const formatDateTime = (dateTimeStr?: string): string => {
        if (!dateTimeStr) return '-';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch {
            return dateTimeStr;
        }
    };

    const calculateDuration = (startTime?: string, endTime?: string): string => {
        if (!startTime) return '-';
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const handleUpdateStatus = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowStatusModal(true);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedAssignment || !selectedAssignment.assignmentId) {
            alert('Assignment ID not found.');
            return;
        }

        // Map frontend status to backend status
        const statusMap: { [key: string]: 'ASSIGNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' } = {
            'Scheduled': 'ASSIGNED',
            'In Progress': 'IN_PROGRESS',
            'Paused': 'PAUSED',
            'Awaiting Parts': 'PAUSED',
            'Completed': 'COMPLETED',
            'Cancelled': 'CANCELLED'
        };

        const backendStatus = statusMap[newStatus] || 'ASSIGNED';

        try {
            await updateAssignmentStatus(selectedAssignment.assignmentId, backendStatus);
            
            // Refresh assignments
            if (userId) {
                await fetchAssignments(userId);
            }
            
            setShowStatusModal(false);
            setSelectedAssignment(null);
            alert(`Status updated to: ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
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
                            {assignments.filter(a => a.status === 'In Progress' || a.status === 'IN_PROGRESS').length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Scheduled</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {assignments.filter(a => a.status === 'Scheduled' || a.status === 'ASSIGNED').length}
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
                    
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                            <p className="text-gray-400 mt-4">Loading assignments...</p>
                        </div>
                    ) : assignments.length === 0 ? (
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
                                            {(assignment.status === 'In Progress' || assignment.status === 'IN_PROGRESS') && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                                                    In Progress
                                                </span>
                                            )}
                                            {(assignment.status === 'Scheduled' || assignment.status === 'ASSIGNED') && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                    Scheduled
                                                </span>
                                            )}
                                            {assignment.status === 'COMPLETED' && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                                                    Completed
                                                </span>
                                            )}
                                            {assignment.status === 'PAUSED' && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500/20 text-orange-400">
                                                    Paused
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
                                        {(assignment.status === 'Scheduled' || assignment.status === 'ASSIGNED') && (
                                            <button 
                                                onClick={() => handleStartWork(assignment)}
                                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition text-sm"
                                            >
                                                Start Work
                                            </button>
                                        )}
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

                        {/* Time Log History */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4">Time Log History</h3>
                            {loadingTimeLogs ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
                                    <p className="text-gray-400 text-sm mt-2">Loading time logs...</p>
                                </div>
                            ) : timeLogs.length === 0 ? (
                                <p className="text-gray-400 text-sm">No time logs recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {timeLogs.map((log, index) => (
                                        <div key={log.id || index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Start Time</p>
                                                    <p className="text-white text-sm font-medium">{formatDateTime(log.startTime)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">End Time</p>
                                                    <p className="text-white text-sm font-medium">
                                                        {log.endTime ? formatDateTime(log.endTime) : <span className="text-yellow-400">In Progress</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Duration</p>
                                                    <p className="text-white text-sm font-medium">
                                                        {calculateDuration(log.startTime, log.endTime)}
                                                    </p>
                                                </div>
                                                {log.note && (
                                                    <div>
                                                        <p className="text-gray-400 text-xs mb-1">Note</p>
                                                        <p className="text-white text-sm">{log.note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
