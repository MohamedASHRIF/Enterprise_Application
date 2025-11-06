"use client"

interface Service {
    id: number;
    name: string;
    description: string;
    duration: string;
    price: string;
    category: string;
}

interface ServiceSelectionProps {
    services: Service[];
    selectedService: any;
    onSelectService: (service: Service) => void;
}

export default function ServiceSelection({ services, selectedService, onSelectService }: ServiceSelectionProps) {
    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className={`p-4 rounded-xl border-2 transition text-left ${
                            selectedService?.id === service.id
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-semibold">{service.name}</h3>
                            {selectedService?.id === service.id && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#06b6d4" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-cyan-400">{service.duration}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-green-400 font-semibold">{service.price}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}




