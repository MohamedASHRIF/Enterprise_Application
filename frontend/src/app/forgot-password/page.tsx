"use client"
import { useState } from "react";
import api from "../api/api";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage("Password reset link has been sent to your email. Please check your inbox (and spam folder).");
      setEmail("");
    } catch (err) {
      console.error('Forgot password error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-center bg-cover bg-[url('/Login.png')]" style={{backgroundImage: "url('/Login.png')"}}>
      <div className="bg-gradient-to-br from-white/98 via-white/96 to-white/98 backdrop-blur-xl flex flex-col w-full max-w-md mx-4 p-10 rounded-3xl shadow-2xl border border-gray-200/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Forgot Password?</h1>
          <p className="text-gray-600 font-medium">Enter your email address and we&apos;ll send you a link to reset your password</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl relative z-10">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium text-sm">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl relative z-10">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <input 
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 pr-10 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-950 hover:to-indigo-900 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-indigo-950/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10">
          <Link href="/" className="text-indigo-700 hover:text-indigo-900 font-bold transition-colors underline decoration-2 underline-offset-2 hover:decoration-indigo-900 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
