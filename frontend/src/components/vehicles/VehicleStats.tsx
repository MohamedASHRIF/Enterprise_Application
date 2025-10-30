"use client"

interface VehicleStatsProps {
    totalVehicles: number;
    activeVehicles: number;
    defaultPlate: string;
}

export default function VehicleStats({ totalVehicles, activeVehicles, defaultPlate }: VehicleStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Total Vehicles</p>
                        <p className="text-3xl font-bold text-white mt-2">{totalVehicles}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3b82f6" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m12.75 4.5H9.75m3-4.5H3.375A1.125 1.125 0 012 13.125V11.25m22.5 2.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V9.75M8.25 18.75h.375a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM8.25 3.375h6.75c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125H8.25a1.125 1.125 0 01-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Active Vehicles</p>
                        <p className="text-3xl font-bold text-white mt-2">{activeVehicles}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#22c55e" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.08a7.5 7.5 0 01-1.43 4.338m5.222 0a7.497 7.497 0 00.572-.24.25.25 0 00-.035-.075L15.75 12.5a.75.75 0 00-1.062-1.062L12.47 14.47l-1.453-1.453a.75.75 0 00-1.062 1.062l2 2a.75.75 0 001.063 0l4-4A7.5 7.5 0 0121 12z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Default Vehicle</p>
                        <p className="text-2xl font-bold text-white mt-2">{defaultPlate || "None"}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a855f7" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A2.25 2.25 0 003.75 4.5v15A2.25 2.25 0 006 21.75h12A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0018 1.5H6z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}



