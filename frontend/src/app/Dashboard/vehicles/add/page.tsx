"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { addVehicle } from "@/app/api/customerApi";

// Backend Integration: POST /api/vehicles

export default function AddVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    plate: "",
    color: "",
    vin: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation: basic checks (VIN optional on backend)
    if (formData.plate && formData.plate.trim().length === 0) {
      setErrorMessage("License plate cannot be empty");
      setIsLoading(false);
      return;
    }

    try {
      // Build payload matching backend Vehicle entity
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = stored ? JSON.parse(stored) : null;

      const payload = {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || 0,
        color: formData.color,
        plate: formData.plate,
        customerId: user?.id || user?.userId || null,
        // Backend field name is `VIN` (uppercase) in the Vehicle entity
        VIN: formData.vin || "",
      };

      setErrorMessage(null);
      const res = await addVehicle(payload);
      console.log("Vehicle added (response):", res);

      // Treat any truthy response as success. `addVehicle` returns either
      // an ApiResponse shape ({ success?, data?, message? }) or the
      // created vehicle object directly depending on backend.
      if (res) {
        // Success: set a localStorage flag so other pages (book service) can detect and refresh
        try {
          localStorage.setItem("vehiclesUpdated", String(Date.now()));
        } catch (e) {
          // ignore
        }
        // Success
        alert("Vehicle added successfully!");
        router.push("/Dashboard/vehicles");
      } else {
        // No data returned - treat as failure
        setErrorMessage("Failed to add vehicle. No response from server.");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      const apiMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Please try again.";
      setErrorMessage(`Failed to add vehicle. ${apiMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            Add New Vehicle
          </h1>
          <p className="text-gray-400">
            Enter your vehicle details to register
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-900/80 border border-red-700 p-3 text-sm text-red-100">
              <div className="flex justify-between items-start">
                <div>{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="ml-4 text-red-200 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Make & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Make/Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                  placeholder="e.g., Toyota"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                  placeholder="e.g., Camry"
                />
              </div>
            </div>

            {/* Year & Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                  placeholder="e.g., 2021"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                  placeholder="e.g., Silver"
                />
              </div>
            </div>

            {/* License Plate */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                License Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                placeholder="e.g., ABC-1234"
              />
            </div>

            {/* VIN (Optional) */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                VIN (Vehicle Identification Number)
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleInputChange}
                // VIN is optional on backend; keep client-side optional
                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white placeholder-gray-500"
                placeholder="Enter VIN (optional)"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
