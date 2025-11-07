"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

export default function BookServicePage() {
    const router = useRouter();
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [customRequest, setCustomRequest] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const userId = await resolveCustomerId();

                // Fetch vehicles
                if (userId) {
                    const vehiclesResponse = await customerApi.get(`/api/vehicles/customer/${userId}`);
                    let vehiclesData = vehiclesResponse.data || [];

                    if (typeof vehiclesData === 'string') {
                        try {
                            vehiclesData = JSON.parse(vehiclesData);
                        } catch (e) {
                            console.error('Failed to parse vehicles data:', e);
                            vehiclesData = [];
                        }
                    }

                    if (Array.isArray(vehiclesData)) {
                        const normalizedVehicles = vehiclesData.map((v: any) => ({
                            id: v.id,
                            make: v.make || '',
                            model: v.model || '',
                            year: v.year || '',
                            plate: v.plate || '',
                            color: v.color || '',
                            vin: v.vin || v.VIN || ''
                        }));
                        setVehicles(normalizedVehicles);
                    } else {
                        console.warn('Vehicles response is not an array:', vehiclesData);
                        setVehicles([]);
                    }
                } else {
                    console.warn('No userId available, skipping vehicle fetch');
                    setVehicles([]);
                }

                // Fetch services
                const servicesResponse = await customerApi.get('/services/all');
                const servicesData = servicesResponse.data || [];
                // Ensure servicesData is an array before mapping
                if (Array.isArray(servicesData)) {
                    setServices(servicesData.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        description: s.description || '',
                        duration: s.estimatedDuration ? `${s.estimatedDuration} min` : 'N/A',
                        price: typeof s.price === 'number' ? `$${s.price.toFixed(2)}` : 'N/A',
                        category: s.category || '',
                        estimatedDuration: s.estimatedDuration
                    })));
                } else {
                    console.warn('Services response is not an array:', servicesData);
                    setServices([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleContinue = () => {
        if (!selectedVehicle || !selectedService) {
            alert('Please select a vehicle and service');
            return;
        }
        
        // Store selection in session/location state
        sessionStorage.setItem('bookingData', JSON.stringify({
            vehicle: selectedVehicle,
            service: selectedService,
            customRequest
        }));
        
        router.push('/Dashboard/book-service/slots');
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Book a Service</h1>
                    <p className="text-gray-400">Select your vehicle and choose a service</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                            <span className="text-white font-medium">Vehicle & Service</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold">2</div>
                            <span className="text-gray-500">Time Slot</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold">3</div>
                            <span className="text-gray-500">Confirm</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Vehicle & Service Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Selection */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Select Vehicle</h2>
                            {loading ? (
                                <div className="text-gray-400 text-center py-8">Loading vehicles...</div>
                            ) : vehicles.length > 0 ? (
                                <div className="space-y-3">
                                    {vehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicle(vehicle)}
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
                            ) : (
                                <div className="text-gray-400 text-center py-8">
                                    <p>No vehicles registered</p>
                                    <a href="/Dashboard/vehicles" className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
                                        Add a vehicle →
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Service Selection */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Select Service</h2>
                            {loading ? (
                                <div className="text-gray-400 text-center py-8">Loading services...</div>
                            ) : services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
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
                            ) : (
                                <div className="text-gray-400 text-center py-8">No services available</div>
                            )}
                        </div>

                        {/* Custom Request (Optional) */}
                        {(selectedVehicle || selectedService) && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Special Instructions (Optional)</h2>
                                <textarea
                                    value={customRequest}
                                    onChange={(e) => setCustomRequest(e.target.value)}
                                    placeholder="Add any special requests or notes for the technician..."
                                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500 min-h-[100px] resize-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
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

                                {/* Continue Button */}
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedVehicle || !selectedService}
                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Time Slot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




