"use client"

interface BookingSummaryProps {
    selectedVehicle: any;
    selectedService: any;
    date?: string;
    time?: string;
}

export default function BookingSummary({ selectedVehicle, selectedService, date, time }: BookingSummaryProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>

            <div className="space-y-6">
                {/* Vehicle Summary */}
                <div>
                    <p className="text-gray-400 text-sm mb-2">Vehicle</p>
                    {selectedVehicle ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {selectedVehicle.make.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{selectedVehicle.make} {selectedVehicle.model}</p>
                                <p className="text-gray-400 text-xs">{selectedVehicle.plate}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No vehicle selected</p>
                    )}
                </div>

                {/* Service Summary */}
                <div>
                    <p className="text-gray-400 text-sm mb-2">Service</p>
                    {selectedService ? (
                        <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-white font-medium text-sm">{selectedService.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="text-cyan-400">{selectedService.duration}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-green-400">{selectedService.price}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No service selected</p>
                    )}
                </div>

                {/* Date & Time (if provided) */}
                {date && time && (
                    <div>
                        <p className="text-gray-400 text-sm mb-2">Date & Time</p>
                        <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-white font-medium text-sm">{formatDate(date)}</p>
                            <p className="text-cyan-400 font-semibold text-sm mt-1">{time}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}




