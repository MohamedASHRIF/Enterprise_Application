"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatDuration } from "@/lib/services";
import adminApi from "../../api/adminApi";
import { getVehicles } from "@/app/api/customerApi";

// Backend Integration: GET /api/services

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-white">
          <div className="max-w-3xl bg-gray-800 p-6 rounded-lg border border-red-700">
            <h2 className="text-xl font-bold mb-2">Client error while loading page</h2>
            <pre className="text-sm whitespace-pre-wrap max-h-72 overflow-auto">{String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}</pre>
            <div className="mt-4">
              <button className="px-4 py-2 bg-red-600 rounded" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

export default function BookServicePage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [customRequest, setCustomRequest] = useState("");

  // Vehicles will be loaded from the customer API
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Services loaded from admin API
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [servicesLoadingRemote, setServicesLoadingRemote] =
    useState<boolean>(true);
  const [servicesErrorRemote, setServicesErrorRemote] = useState<string | null>(
    null
  );

  const loadVehicles = useCallback(async () => {
    setVehiclesError(null);
    setVehiclesLoading(true);
    try {
      // Try to determine customerId from stored user object
      let customerId: number | undefined;
      try {
        const stored =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const user = stored ? JSON.parse(stored) : null;
        customerId = user?.id || user?.userId || undefined;
      } catch (e) {
        // ignore parse errors
      }

      if (!customerId) {
        // Backend does not expose GET /api/vehicles (no customer id). Ask user to log in.
        setVehicles([]);
        setVehiclesError(
          "Not authenticated as a customer. Please log in or open your profile to add a vehicle."
        );
        return;
      }

      const v = await getVehicles(customerId);
      setVehicles(v || []);
    } catch (err: any) {
      console.error("Failed to load vehicles", err);
      setVehicles([]);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch vehicles";
      setVehiclesError(String(msg));
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    loadVehicles();
    // also load services from admin (debug log will show baseURL)
    try {
      // log adminApi base URL to help debug why services aren't fetched in the browser
      // eslint-disable-next-line no-console
      console.log(
        "BookService: scheduling loadServices; adminApi.baseURL=",
        (adminApi as any)?.defaults?.baseURL
      );
    } catch (e) {}
    loadServices();

    // refresh when window/tab gains focus
    const onFocus = () => {
      loadVehicles();
    };

    // refresh when document becomes visible
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadVehicles();
    };

    // respond to storage events (cross-tab) when another tab updates vehicles
    const onStorage = (e: StorageEvent) => {
      if (e.key === "vehiclesUpdated") {
        loadVehicles();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadVehicles]);

  const loadServices = async () => {
    setServicesErrorRemote(null);
    setServicesLoadingRemote(true);
    try {
      const res = await adminApi.get("/services");
      const data = res.data || [];
      // admin returns array or ApiResponse shape
      const list = Array.isArray(data) ? data : data.data || [];
      // Normalize to expected shape
      const normalized = (list || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        estimateMins: s.estimateMins || s.estimate_mins || s.estimateMins,
        cost: typeof s.cost === "number" ? s.cost : Number(s.cost),
        active: s.active === undefined ? true : Boolean(s.active),
        category: s.category || s.categoryName || "",
      }));
      setServicesList(normalized.filter((s: any) => s.active));
    } catch (err: any) {
      console.error("Failed to load services from admin", err);
      setServicesList([]);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch services";
      setServicesErrorRemote(String(msg));
    } finally {
      setServicesLoadingRemote(false);
    }
  };

  const services = useMemo(() => {
    return servicesList.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: formatDuration(s.estimateMins || s.estimate_mins || 0),
      price: `$${(s.cost || 0).toFixed(2)}`,
      category: s.category || "",
    }));
  }, [servicesList]);

  const handleContinue = () => {
    if (!selectedVehicle || !selectedService) {
      alert("Please select a vehicle and service");
      return;
    }

    // Store selection in session/location state
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        vehicle: selectedVehicle,
        service: selectedService,
        customRequest,
      })
    );

    router.push("/Dashboard/book-service/slots");
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book a Service</h1>
          <p className="text-gray-400">
            Select your vehicle and choose a service
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <span className="text-white font-medium">Vehicle & Service</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold">
                2
              </div>
              <span className="text-gray-500">Time Slot</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold">
                3
              </div>
              <span className="text-gray-500">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle & Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Selection */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Select Vehicle
              </h2>
              <div className="space-y-3">
                {vehiclesLoading ? (
                  <div className="text-gray-400">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                  <div>
                    {vehiclesError ? (
                      <div className="text-red-400">
                        Error loading vehicles: {vehiclesError}
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        No vehicles found. Add a vehicle from your profile to
                        get started.
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await loadVehicles();
                        }}
                        className="px-3 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700"
                      >
                        Refresh
                      </button>

                      <a
                        href="/Dashboard/vehicles/add"
                        className="text-cyan-400 hover:underline text-sm"
                      >
                        Add vehicle
                      </a>
                    </div>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                        selectedVehicle?.id === vehicle.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-800 hover:border-gray-700 bg-gray-800/50"
                      }`}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                        {vehicle.make?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {vehicle.year} • {vehicle.plate}
                        </p>
                      </div>
                      {selectedVehicle?.id === vehicle.id && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="#06b6d4"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Service Selection */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Select Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      selectedService?.id === service.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-gray-800 hover:border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">
                        {service.name}
                      </h3>
                      {selectedService?.id === service.id && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="#06b6d4"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-cyan-400">{service.duration}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-green-400 font-semibold">
                        {service.price}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Request (Optional) */}
            {(selectedVehicle || selectedService) && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Special Instructions (Optional)
                </h2>
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
              <h2 className="text-xl font-bold text-white mb-6">
                Booking Summary
              </h2>

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
                        <p className="text-white font-medium text-sm">
                          {selectedVehicle.make} {selectedVehicle.model}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {selectedVehicle.plate}
                        </p>
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
                      <p className="text-white font-medium text-sm">
                        {selectedService.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-cyan-400">
                          {selectedService.duration}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-green-400">
                          {selectedService.price}
                        </span>
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
    </ErrorBoundary>
  );
}
