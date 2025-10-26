"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: GET /api/slots/available?date=YYYY-MM-DD

export default function TimeSlotPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingData, setBookingData] = useState<any>(null);

    useEffect(() => {
        // Get booking data from session
        const stored = sessionStorage.getItem('bookingData');
        if (stored) {
            setBookingData(JSON.parse(stored));
        } else {
            router.push('/Dashboard/book-service');
        }

        // Set today as default date
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    }, [router]);

    // Mock Time Slots - Replace with backend API
    const timeSlots = [
        { time: "09:00", available: true },
        { time: "10:00", available: false },
        { time: "11:00", available: true },
        { time: "12:00", available: true },
        { time: "13:00", available: false },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
    ];

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select a date and time');
            return;
        }

        // Store time slot in booking data
        const updatedBooking = {
            ...bookingData,
            date: selectedDate,
            time: selectedTime
        };
        
        sessionStorage.setItem('bookingData', JSON.stringify(updatedBooking));
        router.push('/Dashboard/book-service/confirm');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/Dashboard/book-service')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">Select Time Slot</h1>
                    <p className="text-gray-400">Choose a convenient date and time</p>
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
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            <span className="text-white font-medium">Step 2</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold">3</div>
                            <span className="text-gray-500">Step 3</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Date & Time Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Selection */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Select Date</h2>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 transition text-white"
                            />
                            {selectedDate && (
                                <p className="text-cyan-400 mt-3 text-sm font-medium">
                                    {formatDate(selectedDate)}
                                </p>
                            )}
                        </div>

                        {/* Time Slots */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Available Time Slots</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        onClick={() => slot.available && setSelectedTime(slot.time)}
                                        disabled={!slot.available}
                                        className={`p-4 rounded-xl border-2 transition text-center ${
                                            selectedTime === slot.time
                                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                : slot.available
                                                ? 'border-gray-800 hover:border-gray-700 text-white bg-gray-800/50'
                                                : 'border-gray-800 bg-gray-800/30 text-gray-600 cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        <p className="font-semibold">{slot.time}</p>
                                        {!slot.available && (
                                            <p className="text-xs text-red-400 mt-1">Booked</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>

                            <div className="space-y-6">
                                {/* Vehicle */}
                                {bookingData?.vehicle && (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-2">Vehicle</p>
                                        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                {bookingData.vehicle.make.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{bookingData.vehicle.make} {bookingData.vehicle.model}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Service */}
                                {bookingData?.service && (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-2">Service</p>
                                        <div className="p-3 bg-gray-800 rounded-lg">
                                            <p className="text-white font-medium text-sm">{bookingData.service.name}</p>
                                            <p className="text-gray-400 text-xs mt-1">{bookingData.service.description}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Date & Time */}
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Date & Time</p>
                                    <div className="p-3 bg-gray-800 rounded-lg">
                                        {selectedDate && selectedTime ? (
                                            <>
                                                <p className="text-white font-medium text-sm">{formatDate(selectedDate)}</p>
                                                <p className="text-cyan-400 font-semibold text-sm mt-1">{selectedTime}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Not selected</p>
                                        )}
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedDate || !selectedTime}
                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Confirmation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

