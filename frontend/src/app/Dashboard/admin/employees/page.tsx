"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
// import api from "../../../api/api"; // Uncomment when wiring real backend

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

interface EmployeeMetrics {
    totalAssignments: number;
    inProgress: number;
    completionRatePct: number; // 0-100
    averageCompletionMins: number; // minutes
}

interface AssignmentLogEntry {
    timestamp: string; // ISO string
    message: string;
    status?: string;
    minutesLogged?: number;
}

interface EmployeeAssignment {
    id: string;
    service: string;
    customer: string;
    vehicle: string;
    scheduledAt: string; // ISO string
    status: 'Scheduled' | 'In Progress' | 'Awaiting Parts' | 'Completed' | 'Cancelled';
    assignedEmployeeId: number;
    timeLoggedMins: number;
    logs: AssignmentLogEntry[];
}

export default function AdminEmployeeManagement() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [employeeMetricsById, setEmployeeMetricsById] = useState<Record<number, EmployeeMetrics>>({});
    const [assignmentsByEmployeeId, setAssignmentsByEmployeeId] = useState<Record<number, EmployeeAssignment[]>>({});
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
    const [selectedEmployeeForAssignments, setSelectedEmployeeForAssignments] = useState<Employee | null>(null);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<EmployeeAssignment | null>(null);
    const [newAssigneeId, setNewAssigneeId] = useState<number | null>(null);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedAssignmentForLogs, setSelectedAssignmentForLogs] = useState<EmployeeAssignment | null>(null);

    // Form state for create/edit
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "EMPLOYEE",
    });

    useEffect(() => {
        // Check if user is authenticated and has ADMIN role
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

            // Only allow ADMIN users
            if (role !== 'ADMIN') {
                alert('Access Denied. Only administrators can access this page.');
                window.location.href = '/Dashboard';
                return;
            }

            fetchEmployees();
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // Filter employees based on search, role, and status
    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch = 
            emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === "ALL" || emp.role === filterRole;
        const matchesStatus = filterStatus === "ALL" || 
            (filterStatus === "ACTIVE" && emp.isActive) ||
            (filterStatus === "INACTIVE" && !emp.isActive);
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API endpoint
            // const response = await api.get('/auth/employees');
            // setEmployees(response.data);
            
            // Mock data for now
            const mockEmployees: Employee[] = [
                {
                    id: 1,
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@autoshop.com",
                    phoneNumber: "+1 234-567-8900",
                    role: "MECHANIC",
                    isActive: true,
                    createdAt: "2024-01-15",
                },
                {
                    id: 2,
                    firstName: "Sarah",
                    lastName: "Smith",
                    email: "sarah.smith@autoshop.com",
                    phoneNumber: "+1 234-567-8901",
                    role: "TECHNICIAN",
                    isActive: true,
                    createdAt: "2024-02-20",
                },
                {
                    id: 3,
                    firstName: "Mike",
                    lastName: "Johnson",
                    email: "mike.johnson@autoshop.com",
                    phoneNumber: "+1 234-567-8902",
                    role: "MECHANIC",
                    isActive: false,
                    createdAt: "2023-12-10",
                },
            ];
            setEmployees(mockEmployees);

            // Mock metrics (replace with API aggregation later)
            const mockMetrics: Record<number, EmployeeMetrics> = {
                1: { totalAssignments: 12, inProgress: 2, completionRatePct: 92, averageCompletionMins: 58 },
                2: { totalAssignments: 9, inProgress: 1, completionRatePct: 88, averageCompletionMins: 65 },
                3: { totalAssignments: 5, inProgress: 0, completionRatePct: 76, averageCompletionMins: 72 },
            };
            setEmployeeMetricsById(mockMetrics);

            // Mock assignments with logs
            const now = new Date();
            const iso = (d: Date) => d.toISOString();
            const mockAssignments: Record<number, EmployeeAssignment[]> = {
                1: [
                    {
                        id: 'APT-1001',
                        service: 'Brake Inspection',
                        customer: 'Alice Martin',
                        vehicle: 'Toyota Corolla 2020',
                        scheduledAt: iso(new Date(now.getTime() + 60 * 60 * 1000)),
                        status: 'Scheduled',
                        assignedEmployeeId: 1,
                        timeLoggedMins: 0,
                        logs: [
                            { timestamp: iso(new Date(now.getTime() - 24 * 60 * 60 * 1000)), message: 'Appointment created', status: 'Scheduled' },
                        ],
                    },
                    {
                        id: 'APT-1002',
                        service: 'Oil Change',
                        customer: 'Bob Lee',
                        vehicle: 'Honda Accord 2019',
                        scheduledAt: iso(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
                        status: 'In Progress',
                        assignedEmployeeId: 1,
                        timeLoggedMins: 35,
                        logs: [
                            { timestamp: iso(new Date(now.getTime() - 3 * 60 * 60 * 1000)), message: 'Checked in', status: 'Scheduled' },
                            { timestamp: iso(new Date(now.getTime() - 2 * 60 * 60 * 1000)), message: 'Work started', status: 'In Progress' },
                        ],
                    },
                ],
                2: [
                    {
                        id: 'APT-1003',
                        service: 'Tire Rotation',
                        customer: 'Charlie Young',
                        vehicle: 'Ford Focus 2018',
                        scheduledAt: iso(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
                        status: 'Scheduled',
                        assignedEmployeeId: 2,
                        timeLoggedMins: 0,
                        logs: [
                            { timestamp: iso(new Date(now.getTime() - 12 * 60 * 60 * 1000)), message: 'Appointment created', status: 'Scheduled' },
                        ],
                    },
                ],
                3: [],
            };
            setAssignmentsByEmployeeId(mockAssignments);
        } catch (error) {
            console.error("Error fetching employees:", error);
            alert("Failed to fetch employees. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const openAssignmentsModal = (employee: Employee) => {
        setSelectedEmployeeForAssignments(employee);
        setShowAssignmentsModal(true);
    };

    const openReassignModal = (assignment: EmployeeAssignment) => {
        setSelectedAssignment(assignment);
        setNewAssigneeId(null);
        setShowReassignModal(true);
    };

    const confirmReassign = () => {
        if (!selectedAssignment || !selectedEmployeeForAssignments || newAssigneeId == null) return;
        if (newAssigneeId === selectedAssignment.assignedEmployeeId) {
            alert('Please choose a different employee to reassign.');
            return;
        }

        const fromId = selectedAssignment.assignedEmployeeId;
        const toId = newAssigneeId;
        const updated = { ...assignmentsByEmployeeId };
        // Remove from old assignee
        updated[fromId] = (updated[fromId] || []).filter(a => a.id !== selectedAssignment.id);
        // Add to new assignee with updated assignment
        const moved: EmployeeAssignment = {
            ...selectedAssignment,
            assignedEmployeeId: toId,
            logs: [
                ...selectedAssignment.logs,
                {
                    timestamp: new Date().toISOString(),
                    message: `Reassigned from employee #${fromId} to #${toId}`,
                    status: 'Scheduled',
                },
            ],
        };
        updated[toId] = [...(updated[toId] || []), moved];
        setAssignmentsByEmployeeId(updated);

        // Update metrics (mock): decrement from old, increment to new
        setEmployeeMetricsById((prev) => {
            const next = { ...prev };
            if (next[fromId]) next[fromId] = { ...next[fromId], totalAssignments: Math.max(0, next[fromId].totalAssignments - 1) };
            if (next[toId]) next[toId] = { ...next[toId], totalAssignments: (next[toId].totalAssignments || 0) + 1 };
            return next;
        });

        setShowReassignModal(false);
        setSelectedAssignment(null);
        alert('Appointment reassigned successfully.');
    };

    const openLogsModal = (assignment: EmployeeAssignment) => {
        setSelectedAssignmentForLogs(assignment);
        setShowLogsModal(true);
    };

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // TODO: Replace with actual API endpoint
            // const response = await api.post('/auth/create-employee', formData);
            // console.log('Employee created:', response.data);
            
            // Mock response for now
            const newEmployee: Employee = {
                id: employees.length + 1,
                ...formData,
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0],
            };
            
            setEmployees([...employees, newEmployee]);
            setShowCreateModal(false);
            resetForm();
            alert("Employee created successfully! Welcome email will be sent.");
        } catch (error) {
            console.error("Error creating employee:", error);
            alert("Failed to create employee. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        
        setIsLoading(true);
        
        try {
            // TODO: Replace with actual API endpoint
            // await api.put(`/auth/employees/${selectedEmployee.id}`, formData);
            
            // Mock update for now
            setEmployees(employees.map(emp => 
                emp.id === selectedEmployee.id 
                    ? { ...emp, ...formData }
                    : emp
            ));
            
            setShowEditModal(false);
            setSelectedEmployee(null);
            resetForm();
            alert("Employee updated successfully!");
        } catch (error) {
            console.error("Error updating employee:", error);
            alert("Failed to update employee. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        
        setIsLoading(true);
        
        try {
            // TODO: Replace with actual API endpoint
            // await api.delete(`/auth/employees/${id}`);
            
            setEmployees(employees.filter(emp => emp.id !== id));
            alert("Employee deleted successfully!");
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("Failed to delete employee. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (employee: Employee) => {
        setIsLoading(true);
        
        try {
            // TODO: Replace with actual API endpoint
            // await api.put(`/auth/employees/${employee.id}/toggle-active`);
            
            setEmployees(employees.map(emp => 
                emp.id === employee.id 
                    ? { ...emp, isActive: !emp.isActive }
                    : emp
            ));
            
            alert(`Employee ${!employee.isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            console.error("Error toggling employee status:", error);
            alert("Failed to update employee status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (employee: Employee) => {
        if (!confirm("Send password reset email to this employee?")) return;
        
        setIsLoading(true);
        
        try {
            // TODO: Replace with actual API endpoint
            // await api.post(`/auth/employees/${employee.id}/reset-password`);
            
            alert(`Password reset email sent to ${employee.email}!`);
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            role: employee.role,
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: "EMPLOYEE",
        });
        setSelectedEmployee(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
                            <p className="text-gray-400">Manage your team members and their access</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white mt-2">{employees.length}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Active Employees</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">
                            {employees.filter(e => e.isActive).length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Mechanics</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {employees.filter(e => e.role === 'MECHANIC').length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Technicians</p>
                        <p className="text-3xl font-bold text-purple-500 mt-2">
                            {employees.filter(e => e.role === 'TECHNICIAN').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="MECHANIC">Mechanic</option>
                                <option value="TECHNICIAN">Technician</option>
                                <option value="EMPLOYEE">General Employee</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Employee List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800 border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assignments</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Performance</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            Loading employees...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-800 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">
                                                            {employee.firstName} {employee.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-400">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                    {employee.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {employee.phoneNumber || "N/A"}
                                            </td>
                                            {/* Assignments summary */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const m = employeeMetricsById[employee.id];
                                                    if (!m) return <span className="text-gray-500 text-sm">N/A</span>;
                                                    return (
                                                        <div className="text-sm">
                                                            <div className="text-white font-medium">{m.totalAssignments} total</div>
                                                            <div className="text-gray-400">{m.inProgress} in progress</div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            {/* Performance summary */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const m = employeeMetricsById[employee.id];
                                                    if (!m) return <span className="text-gray-500 text-sm">N/A</span>;
                                                    return (
                                                        <div className="text-sm">
                                                            <div className="text-green-400 font-semibold">{m.completionRatePct}% completed</div>
                                                            <div className="text-gray-400">Avg {m.averageCompletionMins} min</div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.isActive ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(employee)}
                                                        className="text-cyan-400 hover:text-cyan-300 transition"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(employee)}
                                                        className="text-yellow-400 hover:text-yellow-300 transition"
                                                        title="Reset Password"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(employee)}
                                                        className={employee.isActive ? "text-orange-400 hover:text-orange-300 transition" : "text-green-400 hover:text-green-300 transition"}
                                                        title={employee.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {employee.isActive ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                        className="text-red-400 hover:text-red-300 transition"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => openAssignmentsModal(employee)}
                                                        className="text-blue-400 hover:text-blue-300 transition"
                                                        title="View Assignments"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v-8.5a2.75 2.75 0 00-2.75-2.75h-4.5A2.75 2.75 0 005.75 8.75v8.5m10 0V9.75a2.75 2.75 0 00-2.75-2.75h-4.5m10 10.25h-10" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Assignments Modal */}
                {showAssignmentsModal && selectedEmployeeForAssignments && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Assignments for {selectedEmployeeForAssignments.firstName} {selectedEmployeeForAssignments.lastName}</h2>
                                    <p className="text-gray-400 mt-1">Reassign appointments or view logs</p>
                                </div>
                                <button onClick={() => setShowAssignmentsModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-800 border-b border-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer / Vehicle</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Scheduled</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time Logged</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {(assignmentsByEmployeeId[selectedEmployeeForAssignments.id] || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No assignments.</td>
                                                </tr>
                                            ) : (
                                                assignmentsByEmployeeId[selectedEmployeeForAssignments.id].map((a) => (
                                                    <tr key={a.id} className="hover:bg-gray-800/60">
                                                        <td className="px-6 py-4 text-sm text-gray-300">{a.id}</td>
                                                        <td className="px-6 py-4 text-sm text-white">{a.service}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{a.customer} • {a.vehicle}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{new Date(a.scheduledAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">{a.status}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{a.timeLoggedMins} min</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => openLogsModal(a)}
                                                                    className="text-gray-300 hover:text-white"
                                                                >
                                                                    View Logs
                                                                </button>
                                                                <button
                                                                    onClick={() => openReassignModal(a)}
                                                                    className="text-cyan-400 hover:text-cyan-300"
                                                                >
                                                                    Reassign
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reassign Modal */}
                {showReassignModal && selectedAssignment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-md w-full">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Reassign Appointment</h2>
                                <button onClick={() => setShowReassignModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-gray-300 text-sm">{selectedAssignment.id} • {selectedAssignment.service}</div>
                                <label className="block text-sm font-medium text-gray-400">Assign to</label>
                                <select
                                    value={newAssigneeId ?? ''}
                                    onChange={(e) => setNewAssigneeId(Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="" disabled>Choose employee</option>
                                    {employees.filter(e => e.isActive).map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.role})</option>
                                    ))}
                                </select>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={confirmReassign} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition">Confirm</button>
                                    <button onClick={() => setShowReassignModal(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logs Modal */}
                {showLogsModal && selectedAssignmentForLogs && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Service Logs</h2>
                                    <p className="text-gray-400 mt-1">{selectedAssignmentForLogs.id} • {selectedAssignmentForLogs.service}</p>
                                </div>
                                <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Assigned To</p>
                                            <p className="text-white font-medium">#{selectedAssignmentForLogs.assignedEmployeeId}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <p className="text-white font-medium">{selectedAssignmentForLogs.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Time Logged</p>
                                            <p className="text-white font-medium">{selectedAssignmentForLogs.timeLoggedMins} min</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {selectedAssignmentForLogs.logs.map((log, idx) => (
                                        <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                                {log.status && (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">{log.status}</span>
                                                )}
                                            </div>
                                            <p className="text-white mt-2 text-sm">{log.message}</p>
                                            {typeof log.minutesLogged === 'number' && (
                                                <p className="text-gray-400 text-xs mt-1">+{log.minutesLogged} min</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Employee Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800">
                                <h2 className="text-2xl font-bold text-white">Add New Employee</h2>
                                <p className="text-gray-400 mt-1">Create a new employee account</p>
                            </div>
                            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="MECHANIC">Mechanic</option>
                                        <option value="TECHNICIAN">Technician</option>
                                        <option value="EMPLOYEE">General Employee</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        {isLoading ? "Creating..." : "Create Employee"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Employee Modal */}
                {showEditModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800">
                                <h2 className="text-2xl font-bold text-white">Edit Employee</h2>
                                <p className="text-gray-400 mt-1">Update employee information</p>
                            </div>
                            <form onSubmit={handleEditEmployee} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="MECHANIC">Mechanic</option>
                                        <option value="TECHNICIAN">Technician</option>
                                        <option value="EMPLOYEE">General Employee</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        {isLoading ? "Updating..." : "Update Employee"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowEditModal(false); resetForm(); }}
                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
