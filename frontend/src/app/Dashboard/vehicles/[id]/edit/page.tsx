"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getVehicles, updateVehicle } from '@/app/api/customerApi';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    id: id,
    make: "",
    model: "",
    year: "",
    plate: "",
    color: "",
    VIN: "",
    customerId: null
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // find customer id from localStorage
        let customerId: number | undefined = undefined;
        try {
          const stored = localStorage.getItem('user');
          const user = stored ? JSON.parse(stored) : null;
          customerId = user?.id || user?.userId || user?.customerId;
        } catch (e) {}

        const list = await getVehicles(customerId ? Number(customerId) : undefined);
        const found = (list || []).find((v: any) => Number(v.id) === id);
        if (!found) {
          setError('Vehicle not found');
          return;
        }
        setFormData({
          id: found.id,
          make: found.make || '',
          model: found.model || '',
          year: found.year ? String(found.year) : '',
          plate: found.plate || '',
          color: found.color || '',
          VIN: found.VIN || found.vin || '',
          customerId: found.customerId || found.customer?.id || customerId || null
        });
      } catch (err: any) {
        console.error('Failed to load vehicle', err);
        setError(err?.message || 'Failed to load vehicle');
      } finally {
        setIsLoading(false);
      }
    };
    if (!Number.isNaN(id)) load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p: any) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare payload expected by backend Vehicle entity
      const payload: any = {
        id: formData.id,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || null,
        plate: formData.plate,
        color: formData.color,
        VIN: formData.VIN || '',
        customerId: formData.customerId
      };
      const res = await updateVehicle(payload);
      console.log('Vehicle update response', res);
      alert('Vehicle updated');
      router.push('/Dashboard/vehicles');
    } catch (err: any) {
      console.error('Failed to update vehicle', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to update vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">Loading vehicle...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">Back</button>
          <h1 className="text-3xl font-bold text-white mb-2">Edit Vehicle</h1>
          <p className="text-gray-400">Update your vehicle information</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {error && <div className="mb-4 rounded-md bg-red-900/80 border border-red-700 p-3 text-sm text-red-100">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Make/Brand</label>
                <input name="make" value={formData.make} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Model</label>
                <input name="model" value={formData.model} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Year</label>
                <input name="year" value={formData.year} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Color</label>
                <input name="color" value={formData.color} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">License Plate Number</label>
              <input name="plate" value={formData.plate} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">VIN</label>
              <input name="VIN" value={formData.VIN} onChange={handleChange} className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3.5 text-white" />
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
