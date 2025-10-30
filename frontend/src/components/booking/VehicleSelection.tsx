"use client"

interface Vehicle {
    id: number;
    make: string;
    model: string;
    year: string;
    plate: string;
}

interface VehicleSelectionProps {
    vehicles: Vehicle[];
    selectedVehicle: any;
    onSelectVehicle: (vehicle: Vehicle) => void;
}

export default function VehicleSelection({ vehicles, selectedVehicle, onSelectVehicle }: VehicleSelectionProps) {
    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Vehicle</h2>
            <div className="space-y-3">
                {vehicles.map((vehicle) => (
                    <button
                        key={vehicle.id}
                        onClick={() => onSelectVehicle(vehicle)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                            selectedVehicle?.id === vehicle.id
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                        }`}
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                            {vehicle.make.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-white font-semibold">{vehicle.make} {vehicle.model}</p>
                            <p className="text-gray-400 text-sm">{vehicle.year} • {vehicle.plate}</p>
                        </div>
                        {selectedVehicle?.id === vehicle.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#06b6d4" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}



