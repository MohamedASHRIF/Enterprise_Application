"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import customerApi from "@/app/api/customerApi";

export default function ConfirmBookingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('bookingData');
        if (stored) {
            setBookingData(JSON.parse(stored));
        } else {
            router.push('/Dashboard/book-service');
        }
    }, [router]);

    const handleConfirm = async () => {
        if (!bookingData) {
            alert('Booking data is missing. Please start over.');
            router.push('/Dashboard/book-service');
            return;
        }

        setIsLoading(true);
        
        try {
            // Prepare appointment data for backend
            const appointmentData = {
                vehicleId: bookingData.vehicle.id,
                serviceId: bookingData.service.id,
                appointmentDate: bookingData.date, // Format: YYYY-MM-DD (will be converted to LocalDate)
                appointmentTime: bookingData.time, // Format: HH:mm (String)
                notes: bookingData.customRequest ? [bookingData.customRequest] : []
            };

            // Book appointment via backend API
            const response = await customerApi.post('/api/appointments/book', appointmentData);
            
            console.log('Appointment booked successfully:', response.data);
            
            // Clear session storage
            sessionStorage.removeItem('bookingData');
            
            // Show success message
            alert('Appointment booked successfully!');
            
            // Redirect to appointments page to see the new booking
            router.push('/Dashboard/appointments');
        } catch (error: any) {
            console.error('Error booking appointment:', error);
            console.error('Error response:', error.response?.data);
            
            // Extract detailed error message
            let errorMessage = 'Failed to book appointment. Please try again.';
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (!bookingData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/Dashboard/book-service/slots')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">Confirm Booking</h1>
                    <p className="text-gray-400">Review your appointment details</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <span className="text-green-400 font-medium">Step 1</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-cyan-500"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <span className="text-green-400 font-medium">Step 2</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-cyan-500"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                            <span className="text-white font-medium">Step 3</span>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                    <div className="space-y-6">
                        {/* Vehicle */}
                        <div className="flex items-start gap-4 pb-6 border-b border-gray-800">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                {bookingData.vehicle.make.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                                <p className="text-white font-bold text-lg">{bookingData.vehicle.make} {bookingData.vehicle.model}</p>
                                <p className="text-gray-400 text-sm">{bookingData.vehicle.year} • {bookingData.vehicle.plate}</p>
                            </div>
                        </div>

                        {/* Service */}
                        <div className="flex items-start gap-4 pb-6 border-b border-gray-800">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#a855f7" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 010-3.586L11.3 2.3a2.548 2.548 0 013.586 0l2.123 2.123M11.42 15.17l5.655-5.653" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm mb-1">Service</p>
                                <p className="text-white font-bold text-lg">{bookingData.service.name}</p>
                                <p className="text-gray-400 text-sm">{bookingData.service.description}</p>
                                <p className="text-cyan-400 text-sm font-medium mt-1">{bookingData.service.duration} • {bookingData.service.price}</p>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-start gap-4 pb-6 border-b border-gray-800">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#3b82f6" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm mb-1">Appointment Date & Time</p>
                                <p className="text-white font-bold text-lg">{formatDate(bookingData.date)}</p>
                                <p className="text-cyan-400 font-semibold text-lg mt-1">{bookingData.time}</p>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        {bookingData.customRequest && (
                            <div className="pb-6 border-b border-gray-800">
                                <p className="text-gray-400 text-sm mb-2">Special Instructions</p>
                                <p className="text-white text-sm bg-gray-800 rounded-lg p-3">{bookingData.customRequest}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={() => router.push('/Dashboard/book-service')}
                                className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? 'Booking...' : 'Confirm & Book'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




