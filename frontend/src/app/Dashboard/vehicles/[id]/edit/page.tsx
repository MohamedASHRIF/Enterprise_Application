"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

export default function EditVehiclePage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;
    const [isLoading, setIsLoading] = useState(false);
    const [loadingVehicle, setLoadingVehicle] = useState(true);
    const [customerId, setCustomerId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        id: 0,
        make: '',
        model: '',
        year: '',
        plate: '',
        color: '',
        vin: '',
        customerId: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingVehicle(true);
                
                // Get customerId with fallback
                let userId: number | null = null;
                try {
                    const userResponse = await customerApi.get('/api/users/me');
                    userId = userResponse.data?.id || null;
                } catch (error) {
                    console.error('Error fetching user ID:', error);
                    // Fallback to localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const user = JSON.parse(storedUser);
                            userId = user.id || null;
                        } catch (e) {
                            console.error('Error parsing stored user:', e);
                        }
                    }
                }
                
                if (!userId) {
                    alert('Unable to load user information. Please log in again.');
                    router.push('/Dashboard/vehicles');
                    return;
                }
                
                setCustomerId(userId);

                // Fetch vehicle data
                if (vehicleId && userId) {
                    const vehiclesResponse = await customerApi.get(`/api/vehicles/customer/${userId}`);
                    const vehicles = vehiclesResponse.data || [];
                    const vehicle = vehicles.find((v: any) => v.id.toString() === vehicleId);
                    
                    if (vehicle) {
                        console.log('Loaded vehicle data:', vehicle);
                        setFormData({
                            id: vehicle.id,
                            make: vehicle.make || '',
                            model: vehicle.model || '',
                            year: vehicle.year?.toString() || '',
                            plate: vehicle.plate || '',
                            color: vehicle.color || '',
                            vin: vehicle.VIN || vehicle.vin || '', // Handle both VIN and vin
                            customerId: vehicle.customerId || userId
                        });
                    } else {
                        alert('Vehicle not found');
                        router.push('/Dashboard/vehicles');
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                alert('Failed to load vehicle data');
                router.push('/Dashboard/vehicles');
            } finally {
                setLoadingVehicle(false);
            }
        };

        fetchData();
    }, [vehicleId, router]);

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
            alert('Unable to update vehicle. Please refresh the page.');
            return;
        }

        setIsLoading(true);

        try {
            // Prepare vehicle data matching backend entity structure
            const vehicleData = {
                id: formData.id,
                customerId: customerId,
                make: formData.make.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year) || 0, // Convert to integer for backend
                plate: formData.plate.trim().toUpperCase(),
                color: formData.color.trim() || null,
                vin: formData.vin.trim().toUpperCase() || null // Backend expects lowercase vin field
            };

            // Validate required fields
            if (!vehicleData.make || !vehicleData.model || !vehicleData.plate || vehicleData.year <= 0) {
                alert('Please fill in all required fields (Make, Model, Year, and License Plate).');
                setIsLoading(false);
                return;
            }

            console.log('Sending update request:', vehicleData);
            
            const response = await customerApi.put('/api/vehicles', vehicleData);
            console.log('Vehicle updated successfully:', response.data);
            
            // Set flag to refresh vehicles list (do this first)
            sessionStorage.setItem('vehicles-refresh', 'true');
            
            // Dispatch custom event for refresh (for any open pages)
            window.dispatchEvent(new Event('vehicles-refresh'));
            
            alert('Vehicle updated successfully!');
            
            // Small delay to ensure state is set before navigation
            setTimeout(() => {
                router.push('/Dashboard/vehicles');
                // Force a refresh after navigation
                router.refresh();
            }, 100);
        } catch (error: any) {
            console.error('Error updating vehicle:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Failed to update vehicle. Please try again.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingVehicle) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-gray-400 text-center py-12">Loading vehicle data...</div>
                </div>
            </div>
        );
    }

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
                    
                    <h1 className="text-3xl font-bold text-white mb-2">Edit Vehicle</h1>
                    <p className="text-gray-400">Update your vehicle details</p>
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
                                {isLoading ? 'Updating...' : 'Update Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

