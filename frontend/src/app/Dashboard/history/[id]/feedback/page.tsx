"use client"
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// Backend Integration: 
// GET /api/services/history/{id}
// POST /api/services/history/{id}/feedback

export default function FeedbackPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;
    
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Data - Replace with backend API call
    const [service] = useState({
        id: "SRV-001",
        date: "2024-12-10",
        vehicle: "Ford F-150",
        services: ["Full Service", "Tire Rotation", "Oil Change"],
        technician: "Mike Johnson",
        cost: 199.99
    });

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    const handleStarHover = (starIndex: number) => {
        setHover(starIndex + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            // Backend Integration: POST /api/services/history/{serviceId}/feedback
            // const response = await api.post(`/services/history/${serviceId}/feedback`, {
            //     rating,
            //     feedback,
            //     serviceId
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert('Feedback submitted successfully!');
            router.push(`/Dashboard/history/${serviceId}`);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingLabel = (rating: number) => {
        const labels: { [key: number]: string } = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        return labels[rating] || '';
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Share Your Experience</h1>
                        <p className="text-gray-400">Tell us how we did with your service</p>
                    </div>
                </div>

                {/* Service Summary Card */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Service Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Date</p>
                            <p className="text-white font-semibold">{new Date(service.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                            <p className="text-white font-semibold">{service.vehicle}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Technician</p>
                            <p className="text-white font-semibold">{service.technician}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Cost</p>
                            <p className="text-cyan-400 font-bold text-lg">${service.cost.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm mb-2">Services Performed</p>
                        <div className="flex flex-wrap gap-2">
                            {service.services.map((svc, idx) => (
                                <span key={idx} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-medium">
                                    {svc}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                    <div className="mb-8">
                        <label className="block text-white font-semibold mb-4 text-lg">
                            How would you rate this service?
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                            {Array(5).fill(0).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleStarClick(index)}
                                    onMouseEnter={() => handleStarHover(index)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        className={`w-12 h-12 ${
                                            index < (hover || rating) ? 'text-yellow-400' : 'text-gray-600'
                                        } transition-colors`}
                                    >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-cyan-400 font-medium text-lg">
                                {getRatingLabel(rating)}
                            </p>
                        )}
                    </div>

                    <div className="mb-8">
                        <label htmlFor="feedback" className="block text-white font-semibold mb-4 text-lg">
                            Share your thoughts
                        </label>
                        <textarea
                            id="feedback"
                            rows={6}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us about your experience. What did you like? What could we improve?"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                        />
                        <p className="text-gray-400 text-sm mt-2">
                            {feedback.length} characters
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <div>
                                <h4 className="text-white font-semibold mb-1">Helpful feedback includes:</h4>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>• Quality of service and professionalism</li>
                                    <li>• Technician's communication and expertise</li>
                                    <li>• Overall satisfaction and recommendations</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Feedback'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}



