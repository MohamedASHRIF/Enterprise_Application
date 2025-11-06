"use client"
import { useState, useEffect } from "react";
import { getVehicles, deleteVehicle } from '@/app/api/customerApi';
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import VehicleList from "@/components/vehicles/VehicleList";
import VehicleStats from "@/components/vehicles/VehicleStats";

// Backend Integration: Replace with real API calls
// GET /api/vehicles

export default function VehiclesPage() {
    const router = useRouter();
    
    const [vehicles, setVehicles] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = localStorage.getItem('user');
                const user = stored ? JSON.parse(stored) : null;
                const customerId = user?.id || user?.userId || user?.customerId;
                const list = await getVehicles(customerId ? Number(customerId) : undefined);
                setVehicles(list || []);
            } catch (err) {
                console.error('Failed to load vehicles', err);
            }
        };
        load();
    }, []);

    const handleAddVehicle = () => {
        router.push('/Dashboard/vehicles/add');
    };

    const handleEditVehicle = (id: number) => {
        // Backend Integration: Navigate to edit page
        // router.push(`/Dashboard/vehicles/${id}/edit`);
        alert(`Edit vehicle ${id} - Coming soon`);
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await deleteVehicle(id);
            setVehicles((cur) => cur.filter(v => v.id !== id));
            alert('Vehicle deleted');
        } catch (err) {
            console.error('Delete vehicle failed', err);
            alert('Failed to delete vehicle');
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
                <VehicleStats
                    totalVehicles={vehicles.length}
                    activeVehicles={vehicles.filter(v => v.isDefault).length}
                    defaultPlate={vehicles.find(v => v.isDefault)?.plate || "None"}
                />

                {/* Vehicle List */}
                <VehicleList
                    vehicles={vehicles}
                    onAddVehicle={handleAddVehicle}
                    onEditVehicle={handleEditVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                />
            </div>
        </div>
    );
}

