"use client"
import { useEffect, useState } from "react";
import { defaultServices } from "@/lib/services";
import Navbar from "@/components/Navbar";
import adminApi from "../../../api/adminApi";

export default function AdminServicesPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [services, setServices] = useState<{ id: number; name: string; description: string; estimateMins: number; cost: number; active: boolean; category?: string; }[]>(defaultServices);
    const [form, setForm] = useState({ name: "", description: "", estimateMins: "", cost: "", category: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const res = await adminApi.get('/services');
            setServices(res.data || []);
        } catch (e) {
            console.error('Failed to load services', e);
            alert('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
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

            if (role !== 'ADMIN') {
                alert('Access Denied. Only administrators can access this page.');
                window.location.href = '/Dashboard';
                return;
            }
            fetchServices();
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.description.trim()) {
            alert('Please fill in service name and description.');
            return;
        }
        const mins = Number(form.estimateMins);
        const price = Number(form.cost);
        if (!Number.isFinite(mins) || mins <= 0) {
            alert('Estimate time must be a positive number of minutes.');
            return;
        }
        if (!Number.isFinite(price) || price < 0) {
            alert('Cost must be a non-negative number.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Call backend API to create service
            await adminApi.post('/services', {
                name: form.name.trim(),
                description: form.description.trim(),
                estimateMins: mins,
                cost: price,
            });
            // Reset form
            setForm({ name: "", description: "", estimateMins: "", cost: "", category: "" });
            // Refresh services list from backend (this updates the table and stat cards)
            await fetchServices();
            alert('Service created successfully!');
        } catch (error: any) {
            console.error('Error creating service:', error);
            alert(error?.response?.data?.message || 'Failed to create service. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleActive = async (id: number) => {
        try {
            await adminApi.patch(`/services/${id}/toggle`);
            // Refresh services list to update table and stat cards
            await fetchServices();
        } catch (e) {
            console.error('Failed to toggle service', e);
            alert('Failed to toggle service');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
                    <p className="text-gray-400">Create, edit, and manage available services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Services</p>
                        <p className="text-3xl font-bold text-white mt-2">{services.length}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Active</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">{services.filter(s => s.active).length}</p>
                    </div>
                </div>


                {/* Add Service Form */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Service</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                placeholder="e.g., Oil Change"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Estimate Time (mins)</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={form.estimateMins}
                                onChange={(e) => setForm({ ...form, estimateMins: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                placeholder="e.g., 45"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cost</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cost}
                                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                placeholder="e.g., 39.99"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Category (optional)</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">Select category</option>
                                <option value="immediate category">immediate category</option>
                                <option value="minor category">minor category</option>
                                <option value="major category">major category</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 md:col-start-1 md:col-end-3">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                placeholder="Short description of the service"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Service'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ name: "", description: "", estimateMins: "", cost: "", category: "" })}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                {/* Services List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800 border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estimate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading services...</td>
                                    </tr>
                                ) : services.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No services yet. Add your first service above.</td>
                                    </tr>
                                ) : (
                                    services.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-800/60">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{s.name}</div>
                                                <div className="text-gray-400 text-sm line-clamp-2">{s.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">{s.estimateMins} min</td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">Rs:{s.cost.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                {s.active ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">Active</span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => toggleActive(s.id)} className="text-cyan-400 hover:text-cyan-300">
                                                        {s.active ? 'Deactivate' : 'Activate'}
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
    );
}