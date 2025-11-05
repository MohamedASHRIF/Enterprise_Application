"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    getEmployeeAssignments, 
    enrichAssignmentsWithDetails,
    getEmployeeWorkHours,
    type WorkHoursResponse
} from "@/app/api/employeeApi";

interface Assignment {
    id: string;
    customerName: string;
    vehicle: string;
    service: string;
    status: string;
    assignedDate: string;
    priority: string;
    estimatedDuration: string;
}

export default function EmployeeDashboard() {
    const [userName, setUserName] = useState('Employee');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
    const [workloadStats, setWorkloadStats] = useState({
        totalAssignments: 0,
        activeWork: 0, // IN_PROGRESS + PAUSED
        readyToStart: 0, // ASSIGNED (was "scheduled")
        completedToday: 0,
        totalHoursThisWeek: 0,
        totalHoursThisWeekStr: '0 hr 0 min 0 sec',
        totalHoursTodayStr: '0 hr 0 min 0 sec',
        averageCompletionTime: "0 min"
    });
    const [isLoading, setIsLoading] = useState(true);

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
            fetchDashboardData(employeeId);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // Fetch dashboard data from backend
    const fetchDashboardData = async (employeeId: number) => {
        try {
            setIsLoading(true);
            const assignmentsData = await getEmployeeAssignments(employeeId);
            const enrichedAssignments = await enrichAssignmentsWithDetails(assignmentsData);
            
            // Get recent 3 assignments
            const recent = enrichedAssignments.slice(0, 3);
            setRecentAssignments(recent);
            
            // Calculate stats
            // Active/Ongoing Work = IN_PROGRESS + PAUSED (both are work that needs to continue)
            const activeWork = enrichedAssignments.filter(a => 
                a.status === 'IN_PROGRESS' || a.status === 'PAUSED'
            ).length;
            
            // Get work hours from backend
            const workHours = await getEmployeeWorkHours(employeeId);
            
            // Calculate weekly hours (current week: Monday to Sunday)
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            // Use ISO date (YYYY-MM-DD) comparisons to avoid timezone issues
            const mondayISO = monday.toISOString().split('T')[0];
            const sundayISO = sunday.toISOString().split('T')[0];

            // compute seconds for week and today using workDate (expected as YYYY-MM-DD)
            const weeklySeconds = workHours
                .filter((h: WorkHoursResponse) => {
                    if (!h || !h.workDate) return false;
                    return h.workDate >= mondayISO && h.workDate <= sundayISO;
                })
                .reduce((total: number, h: WorkHoursResponse) => total + (h.totalSeconds || 0), 0);

            const todayStr = now.toISOString().split('T')[0];
            const todaySeconds = workHours
                .filter((h: WorkHoursResponse) => h.workDate === todayStr)
                .reduce((total: number, h: WorkHoursResponse) => total + (h.totalSeconds || 0), 0);

            const formatSecondsToHuman = (secs: number) => {
                const s = Math.max(0, Math.floor(secs));
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                const parts: string[] = [];
                if (h > 0) parts.push(`${h} hr` + (h > 1 ? '' : ''));
                if (m > 0) parts.push(`${m} min`);
                parts.push(`${sec} sec`);
                return parts.join(' ');
            };
            
            // Calculate average completion time from completed assignments
            // For now, using a placeholder - could calculate from time logs if needed
            const completedAssignments = enrichedAssignments.filter(a => a.status === 'COMPLETED');
            // Fallback average: use this week's seconds divided by number of completed assignments (if any)
            let avgCompletionTime = "0 min";
            if (completedAssignments.length > 0) {
                const avgSec = Math.floor(weeklySeconds / completedAssignments.length);
                const mins = Math.max(1, Math.round(avgSec / 60));
                avgCompletionTime = `${mins} min`;
            }
            
            const stats = {
                totalAssignments: enrichedAssignments.length,
                activeWork: activeWork, // IN_PROGRESS + PAUSED combined
                readyToStart: enrichedAssignments.filter(a => a.status === 'ASSIGNED').length, // Changed from "scheduled"
                completedToday: enrichedAssignments.filter(a => a.status === 'COMPLETED').length, // Could add date check
                totalHoursThisWeek: Math.round((weeklySeconds / 3600) * 10) / 10, // numeric hours for any legacy usage
                totalHoursThisWeekStr: formatSecondsToHuman(weeklySeconds),
                totalHoursTodayStr: formatSecondsToHuman(todaySeconds),
                averageCompletionTime: avgCompletionTime
            };
            setWorkloadStats(stats);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Keep default stats on error
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking authentication
    if (!userRole) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {userName}!</h1>
                    <p className="text-gray-400">Manage your workload and track your service assignments</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Assignments</p>
                                <p className="text-3xl font-bold text-white mt-2">{workloadStats.totalAssignments}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3b82f6" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H77.25z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active Work</p>
                                <p className="text-3xl font-bold text-yellow-500 mt-2">{workloadStats.activeWork}</p>
                                <p className="text-xs text-gray-500 mt-1">In Progress + Paused</p>
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
                                <p className="text-gray-400 text-sm">Ready to Start</p>
                                <p className="text-3xl font-bold text-blue-500 mt-2">{workloadStats.readyToStart}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3b82f6" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H77.25z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Completed Today</p>
                                <p className="text-3xl font-bold text-green-500 mt-2">{workloadStats.completedToday}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#22c55e" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.08a7.5 7.5 0 01-1.43 4.338m5.222 0a7.497 7.497 0 00.572-.24.25.25 0 00-.035-.075L15.75 12.5a.75.75 0 00-1.062-1.062L12.47 14.47l-1.453-1.453a.75.75 0 00-1.062 1.062l2 2a.75.75 0 001.063 0l4-4A7.5 7.5 0 0121 12z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Hours This Week</p>
                                <p className="text-3xl font-bold text-purple-500 mt-2">{workloadStats.totalHoursThisWeekStr}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a855f7" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Avg. Completion Time</p>
                                <p className="text-3xl font-bold text-cyan-500 mt-2">{workloadStats.averageCompletionTime}</p>
                            </div>
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#06b6d4" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-3C12.75 12.504 13.254 12 13.875 12h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zm9.75-3C22.5 9.504 23.004 9 23.625 9h2.25C26.496 9 27 9.504 27 10.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V10.125z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Assignments */}
                    <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Recent Assignments</h2>
                            <a href="/Dashboard/employee/assignments" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                View All →
                            </a>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                                    <p className="text-gray-400 mt-4">Loading assignments...</p>
                                </div>
                            ) : recentAssignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No assignments yet.</p>
                                </div>
                            ) : (
                                recentAssignments.map((assignment) => (
                                    <div key={assignment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {(assignment.status === 'In Progress' || assignment.status === 'IN_PROGRESS') && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                                            In Progress
                                                        </span>
                                                    )}
                                                    {assignment.status === 'PAUSED' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                                                            Paused
                                                        </span>
                                                    )}
                                                    {(assignment.status === 'Scheduled' || assignment.status === 'ASSIGNED') && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                                            Ready to Start
                                                        </span>
                                                    )}
                                                    {assignment.status === 'COMPLETED' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                            Completed
                                                        </span>
                                                    )}
                                                    {assignment.priority === 'High' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                                            High Priority
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400 text-xs">{assignment.id}</span>
                                                </div>
                                                <h3 className="text-white font-semibold mb-1">{assignment.service}</h3>
                                                <p className="text-gray-400 text-sm">{assignment.customerName} • {assignment.vehicle}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                        </svg>
                                                        <span>{assignment.assignedDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{assignment.estimatedDuration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <a href="/Dashboard/employee/assignments" className="mt-4 block text-center py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition">
                            View All Assignments
                        </a>
                    </div>

                    {/* Quick Actions & Workload */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <a href="/Dashboard/employee/assignments" className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H77.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">My Assignments</p>
                                            <p className="text-gray-400 text-sm">View and manage assignments</p>
                                        </div>
                                    </div>
                                </a>

                                <a href="/Dashboard/employee/schedule" className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">My Schedule</p>
                                            <p className="text-gray-400 text-sm">View weekly schedule</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Workload Summary */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Workload Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Active Work</span>
                                    <span className="text-white font-semibold">{workloadStats.activeWork}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Ready to Start</span>
                                    <span className="text-white font-semibold">{workloadStats.readyToStart}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Completed Today</span>
                                    <span className="text-green-500 font-semibold">{workloadStats.completedToday}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Weekly Hours</span>
                                        <span className="text-purple-500 font-semibold">{workloadStats.totalHoursThisWeekStr}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-gray-400 text-sm">Today</span>
                                        <span className="text-purple-500 font-semibold">{workloadStats.totalHoursTodayStr}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

