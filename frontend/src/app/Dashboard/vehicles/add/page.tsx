"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

export default function AddVehiclePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [customerId, setCustomerId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        plate: '',
        color: '',
        vin: ''
    });

    useEffect(() => {
        const fetchCustomerId = async () => {
            try {
                const userResponse = await customerApi.get('/api/users/me');
                if (userResponse.data?.id) {
                    setCustomerId(userResponse.data.id);
                } else {
                    // Fallback to localStorage if API doesn't return id
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const user = JSON.parse(storedUser);
                            if (user.id) {
                                setCustomerId(user.id);
                            }
                        } catch (e) {
                            console.error('Error parsing stored user:', e);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
                // Fallback to localStorage if API fails
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        if (user.id) {
                            setCustomerId(user.id);
                        }
                    } catch (e) {
                        console.error('Error parsing stored user:', e);
                    }
                }
            }
        };
        fetchCustomerId();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Convert VIN to uppercase automatically
        const processedValue = name === 'vin' ? value.toUpperCase() : value;
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!customerId) {
            alert('Unable to add vehicle. Please refresh the page.');
            return;
        }

        setIsLoading(true);

        try {
            // Prepare vehicle data matching backend entity structure
            const vinValue = formData.vin.trim().toUpperCase();
            const vehicleData = {
                customerId: customerId,
                make: formData.make.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year) || 0, // Convert to integer for backend
                plate: formData.plate.trim().toUpperCase(), // Normalize plate
                color: formData.color.trim() || null,
                vin: vinValue || null // Backend expects lowercase field name
            };

            // Validate required fields
            if (!vehicleData.make || !vehicleData.model || !vehicleData.plate || vehicleData.year <= 0) {
                alert('Please fill in all required fields (Make, Model, Year, and License Plate).');
                setIsLoading(false);
                return;
            }

            // Validate VIN if provided (should be 17 characters, but allow empty)
            if (vehicleData.vin && vehicleData.vin.length > 0 && vehicleData.vin.length !== 17) {
                alert('VIN must be exactly 17 characters if provided.');
                setIsLoading(false);
                return;
            }
            
            // If VIN is empty string, convert to null
            if (vehicleData.vin === '') {
                vehicleData.vin = null;
            }

            console.log('Sending vehicle data:', vehicleData);
            const response = await customerApi.post('/api/vehicles', vehicleData);
            console.log('Vehicle added successfully:', response.data);
            
            // Set flag to refresh vehicles list (do this first)
            sessionStorage.setItem('vehicles-refresh', 'true');
            
            // Dispatch custom event for refresh (for any open pages)
            window.dispatchEvent(new Event('vehicles-refresh'));
            
            alert('Vehicle added successfully!');
            
            // Small delay to ensure state is set before navigation
            setTimeout(() => {
                // Navigate back to vehicles list
                router.push('/Dashboard/vehicles');
                // Force a refresh after navigation
                router.refresh();
            }, 100);
        } catch (error: any) {
            console.error('Error adding vehicle:', error);
            console.error('Error response:', error.response?.data);
            
            // Extract detailed error message
            let errorMessage = 'Failed to add vehicle. Please try again.';
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.details) {
                    errorMessage = errorData.details;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error: ${errorMessage}`);
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
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    required
                                    min="1900"
                                    max="2100"
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

