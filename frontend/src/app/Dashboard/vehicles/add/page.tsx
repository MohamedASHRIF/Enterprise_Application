"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/app/api/api";

// Backend Integration: POST /api/vehicles

export default function AddVehiclePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        plate: '',
        color: '',
        vin: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Backend Integration: POST /api/vehicles
            // const res = await api.post('/vehicles', formData);
            // console.log('Vehicle added:', res.data);
            
            // Mock success for now
            console.log('Vehicle data:', formData);
            alert('Vehicle added successfully!');
            
            // Navigate back to vehicles list
            router.push('/Dashboard/vehicles');
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert('Failed to add vehicle. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">Add New Vehicle</h1>
                    <p className="text-gray-400">Enter your vehicle details to register</p>
                </div>

                {/* Form Card */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Make & Model */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Make/Brand <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                    placeholder="e.g., Toyota"
                                />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Model <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                    placeholder="e.g., Camry"
                                />
                            </div>
                        </div>

                        {/* Year & Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                    placeholder="e.g., 2021"
                                />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Color <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                    placeholder="e.g., Silver"
                                />
                            </div>
                        </div>

                        {/* License Plate */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                License Plate Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="plate"
                                value={formData.plate}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                placeholder="e.g., ABC-1234"
                            />
                        </div>

                        {/* VIN (Optional) */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                VIN (Vehicle Identification Number)
                            </label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                                placeholder="Optional"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? 'Adding...' : 'Add Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

