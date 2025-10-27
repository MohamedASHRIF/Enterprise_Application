"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

// Backend Integration: 
// GET /api/profile
// PUT /api/profile
// PUT /api/profile/password
// GET /api/preferences
// PUT /api/preferences

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // User Profile Data - Initialize from localStorage
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    // Password Change Form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Settings/Preferences
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        serviceReminders: true,
        marketingEmails: false,
        language: 'en',
        timezone: 'America/New_York'
    });

    useEffect(() => {
        // Load user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setProfileData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: ''
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Load preferences
        // Backend Integration: Load preferences from API
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Backend Integration: PUT /api/profile
            // await api.put('/profile', profileData);
            
            // Update localStorage
            const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            // Backend Integration: PUT /api/profile/password
            // await api.put('/profile/password', {
            //     currentPassword: passwordData.currentPassword,
            //     newPassword: passwordData.newPassword
            // });
            
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please check your current password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        setIsLoading(true);
        
        try {
            // Backend Integration: PUT /api/preferences
            // await api.put('/preferences', preferences);
            
            alert('Preferences updated successfully!');
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert('Failed to update preferences');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
                    <p className="text-gray-400">Manage your account information and preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-800">
                    {[
                        { id: 'profile', label: 'Profile', icon: '👤' },
                        { id: 'security', label: 'Security', icon: '🔒' },
                        { id: 'preferences', label: 'Preferences', icon: '⚙️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold text-sm transition relative ${
                                activeTab === tab.id
                                    ? 'text-cyan-400'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                            <button
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition text-sm font-medium"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="123 Main Street"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.city}
                                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="New York"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.state}
                                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="NY"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.zipCode}
                                        onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="10001"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-gray-400 text-sm font-semibold mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        placeholder="Enter your current password"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPasswords.current ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l-2.586-.586M6.228 6.228l-2.586-.586m0 0L3.98 8.223m2.268 2.268l2.566 2.566M21 21l-2.228-2.228M21 21l-2.228-2.228m0 0L18.022 15.777M21 21H3m3.228 3.228l-2.686-.686" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-semibold mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Enter your new password"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPasswords.new ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l-2.586-.586M6.228 6.228l-2.586-.586m0 0L3.98 8.223m2.268 2.268l2.566 2.566M21 21l-2.228-2.228M21 21l-2.228-2.228m0 0L18.022 15.777M21 21H3m3.228 3.228l-2.686-.686" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-500 text-xs mt-2">Password must be at least 8 characters</p>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-semibold mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Confirm your new password"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPasswords.confirm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l-2.586-.586M6.228 6.228l-2.586-.586m0 0L3.98 8.223m2.268 2.268l2.566 2.566M21 21l-2.228-2.228M21 21l-2.228-2.228m0 0L18.022 15.777M21 21H3m3.228 3.228l-2.686-.686" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                            <button
                                onClick={handlePreferencesUpdate}
                                disabled={isLoading}
                                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition text-sm font-medium disabled:opacity-50"
                            >
                                Save Preferences
                            </button>
                        </div>

                        <div className="space-y-6 max-w-2xl">
                            {/* Notification Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                                
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via text message' },
                                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' }
                                ].map((setting) => (
                                    <div key={setting.key} className="flex items-start justify-between p-4 bg-gray-800 rounded-xl">
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold">{setting.label}</h4>
                                            <p className="text-gray-400 text-sm">{setting.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences[setting.key as keyof typeof preferences] as boolean}
                                                onChange={(e) => setPreferences({ ...preferences, [setting.key]: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Settings */}
                            <div className="space-y-4 pt-6 border-t border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Additional Settings</h3>
                                
                                {[
                                    { key: 'serviceReminders', label: 'Service Reminders', description: 'Get reminders for upcoming appointments' },
                                    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional content and offers' }
                                ].map((setting) => (
                                    <div key={setting.key} className="flex items-start justify-between p-4 bg-gray-800 rounded-xl">
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold">{setting.label}</h4>
                                            <p className="text-gray-400 text-sm">{setting.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences[setting.key as keyof typeof preferences] as boolean}
                                                onChange={(e) => setPreferences({ ...preferences, [setting.key]: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
                                        </label>
                                    </div>
                                ))}

                                {/* Language Selection */}
                                <div className="p-4 bg-gray-800 rounded-xl">
                                    <label className="block text-white font-semibold mb-2">Language</label>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>

                                {/* Timezone Selection */}
                                <div className="p-4 bg-gray-800 rounded-xl">
                                    <label className="block text-white font-semibold mb-2">Timezone</label>
                                    <select
                                        value={preferences.timezone}
                                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                                    >
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

