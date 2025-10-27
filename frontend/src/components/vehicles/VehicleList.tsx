"use client"
import { useState } from "react";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    year: string;
    plate: string;
    color: string;
    isDefault: boolean;
}

interface VehicleListProps {
    vehicles: Vehicle[];
    onAddVehicle: () => void;
    onEditVehicle: (id: number) => void;
    onDeleteVehicle: (id: number) => void;
}

export default function VehicleList({ vehicles, onAddVehicle, onEditVehicle, onDeleteVehicle }: VehicleListProps) {
    if (vehicles.length === 0) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                    </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">No Vehicles Added Yet</h3>
                <p className="text-gray-400 mb-6">Add your first vehicle to get started with booking services</p>
                <button
                    onClick={onAddVehicle}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Your First Vehicle
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
                <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={() => onEditVehicle(vehicle.id)}
                    onDelete={() => onDeleteVehicle(vehicle.id)}
                />
            ))}
        </div>
    );
}

function VehicleCard({ vehicle, onEdit, onDelete }: { vehicle: Vehicle; onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-cyan-500/50 transition">
            {vehicle.isDefault && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#06b6d4" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A2.25 2.25 0 003.75 4.5v15A2.25 2.25 0 006 21.75h12A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0018 1.5H6z" />
                        </svg>
                        <span className="text-cyan-400 text-sm font-semibold">Default Vehicle</span>
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-gray-400 text-sm">{vehicle.year}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6.75-13.5V7.5c0-1.242-.94-2.25-2.1-2.25h-3.3c-1.16 0-2.1.008-2.1 2.25v0c0 1.242.94 2.25 2.1 2.25h3.3c1.16 0 2.1-.008 2.1-2.25zm-6.75 13.5h6.75v-7.5h-6.75v7.5z" />
                        </svg>
                        <span className="text-gray-400">Plate: {vehicle.plate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.28-5.25 13.25-12 13.25S-4.5 17.78-4.5 10.5a12.75 12.75 0 0125.5 0z" />
                        </svg>
                        <span className="text-gray-400">Color: {vehicle.color}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

