"use client"
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import VehicleList from "@/components/vehicles/VehicleList";
import VehicleStats from "@/components/vehicles/VehicleStats";
import customerApi from "@/app/api/customerApi";

export default function VehiclesPage() {
    const router = useRouter();
    const pathname = usePathname();
    
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerId, setCustomerId] = useState<number | null>(null);

    const resolveCustomerId = async (): Promise<number | null> => {
        let resolvedId: number | null = null;

        try {
            const userResponse = await customerApi.get('/api/users/me');
            const apiId = userResponse.data?.id;
            resolvedId = apiId != null ? Number(apiId) : null;
            if (Number.isNaN(resolvedId)) {
                resolvedId = null;
            }
        } catch (error) {
            console.warn('Failed to fetch user ID from API, falling back to localStorage', error);
        }

        if (!resolvedId) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    const localId = user?.id ?? user?.customerId ?? null;
                    resolvedId = localId != null ? Number(localId) : null;
                    if (Number.isNaN(resolvedId)) {
                        resolvedId = null;
                    }
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
        }

        if (resolvedId) {
            setCustomerId(resolvedId);
        }

        return resolvedId;
    };

    const fetchVehicles = async () => {
        try {
            setLoading(true);

            const userId = await resolveCustomerId();

            if (userId) {
                const response = await customerApi.get(`/api/vehicles/customer/${userId}`);
                console.log('Fetched vehicles response:', response);
                console.log('Fetched vehicles data type:', typeof response.data);
                console.log('Fetched vehicles data:', response.data);
                console.log('User ID used for fetch:', userId);
                
                // Handle case where response.data might be a JSON string
                let vehiclesData = response.data;
                if (typeof vehiclesData === 'string') {
                    try {
                        vehiclesData = JSON.parse(vehiclesData);
                        console.log('Parsed vehicles data from string:', vehiclesData);
                    } catch (e) {
                        console.error('Failed to parse vehicles data:', e);
                        vehiclesData = [];
                    }
                }
                
                // Ensure vehiclesData is an array
                if (Array.isArray(vehiclesData)) {
                    // Transform vehicles to match component expectations
                    const transformedVehicles = vehiclesData.map((v: any) => ({
                        id: v.id,
                        make: v.make || '',
                        model: v.model || '',
                        year: v.year?.toString() || '',
                        plate: v.plate || '',
                        color: v.color || '',
                        vin: v.VIN || v.vin || '',
                        isDefault: v.isDefault || false // Add default flag if not present
                    }));
                    console.log('Transformed vehicles:', transformedVehicles);
                    setVehicles(transformedVehicles);
                } else {
                    console.warn('Vehicles response is not an array:', vehiclesData);
                    setVehicles([]);
                }
            } else {
                console.warn('No userId available, cannot fetch vehicles');
            }
        } catch (error: any) {
            console.error('Error fetching vehicles:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            setVehicles([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadVehicles = async () => {
            // Always fetch vehicles on mount
            await fetchVehicles();
            
            // Check if we need to refresh (coming from add/edit)
            const shouldRefresh = sessionStorage.getItem('vehicles-refresh');
            if (shouldRefresh === 'true') {
                sessionStorage.removeItem('vehicles-refresh');
                console.log('Refresh flag detected, refreshing vehicles...');
                // Delay to ensure navigation is complete
                setTimeout(() => {
                    fetchVehicles();
                }, 500);
            }
        };
        
        loadVehicles();
        
        // Listen for custom refresh event
        const handleRefresh = () => {
            console.log('Custom refresh event triggered');
            fetchVehicles();
        };
        
        window.addEventListener('vehicles-refresh', handleRefresh);
        
        // Also refresh when page becomes visible (user navigates back)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('Page visible, refreshing vehicles');
                fetchVehicles();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Refresh on focus (when user switches back to tab)
        const handleFocus = () => {
            console.log('Window focused, refreshing vehicles');
            fetchVehicles();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('vehicles-refresh', handleRefresh);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [pathname]); // Re-run when pathname changes

    const handleAddVehicle = () => {
        router.push('/Dashboard/vehicles/add');
    };

    const handleEditVehicle = (id: number) => {
        router.push(`/Dashboard/vehicles/${id}/edit`);
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) {
            return;
        }

        try {
            await customerApi.delete(`/api/vehicles/${id}`);
            
            // Refresh vehicles list from server
            const activeCustomerId = customerId ?? (await resolveCustomerId());

            if (activeCustomerId) {
                const response = await customerApi.get(`/api/vehicles/customer/${activeCustomerId}`);
                const vehiclesData = response.data || [];
                // Ensure vehiclesData is an array
                if (Array.isArray(vehiclesData)) {
                    setVehicles(vehiclesData);
                } else {
                    console.warn('Vehicles response is not an array:', vehiclesData);
                    setVehicles([]);
                }
            } else {
                // Fallback: remove from local state (only if vehicles is an array)
                if (Array.isArray(vehicles)) {
                    setVehicles(vehicles.filter(v => v.id !== id));
                } else {
                    // If not an array, refetch
                    await fetchVehicles();
                }
            }
            
            alert('Vehicle deleted successfully');
        } catch (error: any) {
            console.error('Error deleting vehicle:', error);
            alert(error.response?.data?.message || 'Failed to delete vehicle. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Vehicles</h1>
                        <p className="text-gray-400">Manage your registered vehicles</p>
                    </div>
                    <button
                        onClick={handleAddVehicle}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Vehicle
                    </button>
                </div>

                {/* Stats */}
                {loading ? (
                    <div className="text-gray-400 text-center py-8">Loading vehicle stats...</div>
                ) : Array.isArray(vehicles) ? (
                    <VehicleStats
                        totalVehicles={vehicles.length}
                        activeVehicles={vehicles.filter(v => v.isDefault).length}
                        defaultPlate={vehicles.find(v => v.isDefault)?.plate || "None"}
                    />
                ) : (
                    <div className="text-gray-400 text-center py-8">No vehicle data available</div>
                )}

                {/* Vehicle List */}
                {loading ? (
                    <div className="text-gray-400 text-center py-8">Loading vehicles...</div>
                ) : (
                    <VehicleList
                        vehicles={Array.isArray(vehicles) ? vehicles : []}
                        onAddVehicle={handleAddVehicle}
                        onEditVehicle={handleEditVehicle}
                        onDeleteVehicle={handleDeleteVehicle}
                    />
                )}
            </div>
        </div>
    );
}

