"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(2); // Mock data - Replace with backend API
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Backend Integration: GET /api/notifications/unread-count
    useEffect(() => {
        // Fetch unread notification count
        // const fetchUnreadCount = async () => {
        //     try {
        //         const response = await api.get('/notifications/unread-count');
        //         setUnreadCount(response.data.count);
        //     } catch (error) {
        //         console.error('Error fetching notification count:', error);
        //     }
        // };
        // fetchUnreadCount();
        
        // Poll every 30 seconds for new notifications
        // const interval = setInterval(fetchUnreadCount, 30000);
        // return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch real user data from localStorage
        const storedUser = localStorage.getItem('user');
        
        // Check if storedUser is valid and not undefined/null
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null' && storedUser.trim() !== '') {
            try {
                const userData = JSON.parse(storedUser);
                
                // Verify userData is an object with expected properties
                if (userData && typeof userData === 'object') {
                    const fullName = userData.firstName && userData.lastName 
                        ? `${userData.firstName} ${userData.lastName}` 
                        : userData.email || 'Customer';
                    
                    setUser({
                        name: fullName,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.role || 'Customer',
                        email: userData.email,
                        phoneNumber: userData.phoneNumber || 'Not provided'
                    });
                } else {
                    // Invalid data structure, redirect to login
                    console.error('Invalid user data structure');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Error parsing user data:', error, 'Stored value:', storedUser);
                // Clear invalid data and redirect to login
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        } else {
            // No valid user data found, redirect to login
            console.log('No user data found in localStorage');
            window.location.href = '/';
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        
        // Backend Integration: Call logout API if needed
        // api.post('/auth/logout');
        
        // Redirect to login page
        window.location.href = '/';
    };

    // Helper function to check if a path is active
    const isActive = (path: string) => {
        if (path === '/Dashboard') {
            return pathname === '/Dashboard';
        }
        return pathname?.startsWith(path);
    };

    const getNavLinkClass = (path: string) => {
        return isActive(path)
            ? 'text-cyan-400 font-semibold px-3 py-2 rounded-md text-sm'
            : 'text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm transition';
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-white font-bold text-xl">AUTOFLOW</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/Dashboard" className={getNavLinkClass('/Dashboard')}>Dashboard</a>
                        
                        {/* Admin-specific links */}
                        {user?.role?.toUpperCase() === 'ADMIN' && (
                            <>
                                <a href="/Dashboard/admin/employees" className={getNavLinkClass('/Dashboard/admin/employees')}>Employee Management</a>
                                <a href="/Dashboard/admin/services" className={getNavLinkClass('/Dashboard/admin/services')}>Services</a>
                                <a href="/Dashboard/admin/reports" className={getNavLinkClass('/Dashboard/admin/reports')}>Reports</a>
                            </>
                        )}
                        
                        {/* Employee-specific links */}
                        {user?.role?.toUpperCase() === 'EMPLOYEE' && (
                            <>
                                <a href="/Dashboard/employee/assignments" className={getNavLinkClass('/Dashboard/employee/assignments')}>My Assignments</a>
                                <a href="/Dashboard/employee/schedule" className={getNavLinkClass('/Dashboard/employee/schedule')}>Schedule</a>
                            </>
                        )}
                        
                        {/* Customer-specific links */}
                        {user?.role?.toUpperCase() === 'CUSTOMER' && (
                            <>
                                <a href="/Dashboard/appointments" className={getNavLinkClass('/Dashboard/appointments')}>My Appointments</a>
                                <a href="/Dashboard/book-service" className={getNavLinkClass('/Dashboard/book-service')}>Book Service</a>
                                <a href="/Dashboard/vehicles" className={getNavLinkClass('/Dashboard/vehicles')}>My Vehicles</a>
                                <a href="/Dashboard/history" className={getNavLinkClass('/Dashboard/history')}>History</a>
                            </>
                        )}
                        
                        {/* Common link for all roles */}
                        <a href="/Dashboard/profile" className={getNavLinkClass('/Dashboard/profile')}>Profile</a>
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <a href="/Dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white transition group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </a>

                        {/* User Profile with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-800 transition"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                {/* Arrow */}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth={2} 
                                    stroke="currentColor" 
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {/* User Info Header */}
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-5 border-b border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-lg">{user?.name || "Customer"}</p>
                                                <p className="text-gray-400 text-sm capitalize">{user?.role?.toLowerCase() || "customer"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="px-6 py-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6.75-13.5V7.5c0-1.242-.94-2.25-2.1-2.25h-3.3c-1.16 0-2.1.008-2.1 2.25v0c0 1.242.94 2.25 2.1 2.25h3.3c1.16 0 2.1-.008 2.1-2.25zm-6.75 13.5h6.75v-7.5h-6.75v7.5z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-xs">First Name</p>
                                                <p className="text-white text-sm font-medium">{user?.firstName || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6.75-13.5V7.5c0-1.242-.94-2.25-2.1-2.25h-3.3c-1.16 0-2.1.008-2.1 2.25v0c0 1.242.94 2.25 2.1 2.25h3.3c1.16 0 2.1-.008 2.1-2.25zm-6.75 13.5h6.75v-7.5h-6.75v7.5z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-xs">Last Name</p>
                                                <p className="text-white text-sm font-medium">{user?.lastName || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-xs">Email</p>
                                                <p className="text-white text-sm font-medium break-all">{user?.email || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-xs">Phone Number</p>
                                                <p className="text-white text-sm font-medium">{user?.phoneNumber || "Not provided"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A2.25 2.25 0 003.75 4.5v15A2.25 2.25 0 006 21.75h12A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0018 1.5H6z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-xs">Role</p>
                                                <p className="text-white text-sm font-medium capitalize">{user?.role?.toLowerCase() || "customer"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-gray-800 p-3 space-y-2">
                                        <a
                                            href="/Dashboard/profile"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a.75.75 0 01.25.224c.09.083.207.131.333.131a.422.422 0 01.425.425c0 .248.07.499.2.707.128.208.31.38.537.523a1.125 1.125 0 01.85.065l1.217-.456c.356-.133.751-.072 1.076.124a2.089 2.089 0 01.22.127c.332.184.582.496.645.87l.214 1.28c.09.543.56.941 1.11.941h2.594c.55 0 1.02-.398 1.11-.941l-.216-1.281a2.09 2.09 0 01-.644-.87 2.17 2.17 0 01-.22-.128c-.354-.196-.721-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 00-.25-.223.422.422 0 01-.425-.425c0-.249-.07-.5-.2-.708a1.428 1.428 0 00-.537-.522 1.125 1.125 0 01-.85-.065l-1.217.456a2.063 2.063 0 01-1.076-.124 2.133 2.133 0 01-.22-.127 2.09 2.09 0 01-.645-.87l-.214-1.281a1.125 1.125 0 00-1.11-.941h-2.593c-.55 0-1.02.398-1.11.94zM18 16.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                            </svg>
                                            Profile & Settings
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-sm font-medium"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

