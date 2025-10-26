"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import VehicleList from "@/components/vehicles/VehicleList";
import VehicleStats from "@/components/vehicles/VehicleStats";

// Backend Integration: Replace with real API calls
// GET /api/vehicles

export default function VehiclesPage() {
    const router = useRouter();
    
    // Mock Data - Replace with backend API calls
    const [vehicles] = useState([
        { 
            id: 1, 
            make: "Toyota", 
            model: "Camry", 
            year: "2021", 
            plate: "ABC-1234",
            color: "Silver",
            isDefault: true
        },
        { 
            id: 2, 
            make: "Honda", 
            model: "Civic", 
            year: "2020", 
            plate: "XYZ-5678",
            color: "Black",
            isDefault: false
        },
        
        { 
            id: 4, 
            make: "Ford", 
            model: "F-150", 
            year: "2022", 
            plate: "FRD-3456",
            color: "Red",
            isDefault: false
        },
        { 
            id: 5, 
            make: "BMW", 
            model: "3 Series", 
            year: "2023", 
            plate: "BMW-7890",
            color: "Blue",
            isDefault: false
        },
        { 
            id: 6, 
            make: "Mercedes-Benz", 
            model: "C-Class", 
            year: "2021", 
            plate: "MRC-1122",
            color: "Black",
            isDefault: false
        },
        { 
            id: 7, 
            make: "Chevrolet", 
            model: "Silverado", 
            year: "2022", 
            plate: "CHV-4455",
            color: "Gray",
            isDefault: false
        },
        { 
            id: 8, 
            make: "Audi", 
            model: "A4", 
            year: "2023", 
            plate: "AUD-6677",
            color: "White",
            isDefault: false
        },
        { 
            id: 9, 
            make: "Nissan", 
            model: "Altima", 
            year: "2020", 
            plate: "NSN-8899",
            color: "Silver",
            isDefault: false
        },
        { 
            id: 10, 
            make: "Hyundai", 
            model: "Elantra", 
            year: "2021", 
            plate: "HYU-1020",
            color: "Red",
            isDefault: false
        }
    ]);

    const handleAddVehicle = () => {
        router.push('/Dashboard/vehicles/add');
    };

    const handleEditVehicle = (id: number) => {
        // Backend Integration: Navigate to edit page
        // router.push(`/Dashboard/vehicles/${id}/edit`);
        alert(`Edit vehicle ${id} - Coming soon`);
    };

    const handleDeleteVehicle = (id: number) => {
        // Backend Integration: Call DELETE /api/vehicles/{id}
        if (confirm('Are you sure you want to delete this vehicle?')) {
            alert(`Delete vehicle ${id} - Backend integration needed`);
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

