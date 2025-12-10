"use client"

import { useState } from "react"
import Link from "next/link"
import api from "../api/api";

export default function Register(){
    const [firstName , setFName] = useState("");
    const [lastName, setLName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const role = "CUSTOMER";

    const validatePasswords = () => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return false;
        }
        if (password.length < 6 && password.length > 0) {
            setPasswordError("Password must be at least 6 characters long");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (confirmPassword) {
            validatePasswords();
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        validatePasswords();
    };

    const handleRegister = async (e: React.FormEvent)=>{
    e.preventDefault();
    
    if (!validatePasswords()) {
        return;
    }
    
    setIsLoading(true);
    setSuccessMessage("");

    try {
      const res= await api.post('/auth/register', {firstName, lastName,email,password, phoneNumber,  role});
      console.log('Register response:', res.data);
      
      // Show success message with email verification instruction
      if (res.data && res.data.message) {
        setSuccessMessage(res.data.message);
        // Clear form
        setFName("");
        setLName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
      } else {
        throw new Error('Invalid response from server');
      }
    }
    catch (err){
        console.log(err);
        alert('Registration Unsuccessful! Please Try Again...');
    } finally {
      setIsLoading(false);
    }
    
  }
    
    return (
        <div className="w-full h-screen flex justify-center items-center bg-center bg-cover bg-[url('/Login.png')]" style={{backgroundImage: "url('/Login.png')"}}>
      <div className="bg-gradient-to-br from-white/98 via-white/96 to-white/98 backdrop-blur-xl flex flex-col w-full max-w-md mx-4 p-10 rounded-3xl shadow-2xl border border-gray-200/50 relative overflow-hidden overflow-y-auto max-h-[90vh]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Create Account</h1>
          <p className="text-gray-600 font-medium">Join us today and get started</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl relative z-10">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-800 font-bold text-sm mb-1">Registration Successful!</p>
                <p className="text-green-700 text-sm">{successMessage}</p>
                <p className="text-green-600 text-xs mt-2 italic">Check your spam folder if you don&apos;t see the email.</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">First Name</label>
              <input 
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
                type="text" 
                value={firstName} 
                onChange={(e) => setFName(e.target.value)} 
                placeholder="John"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Last Name</label>
              <input 
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
                type="text" 
                value={lastName} 
                onChange={(e) => setLName(e.target.value)} 
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Phone Number</label>
            <input 
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
              type="tel" 
              value={phoneNumber} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Email Address</label>
            <input 
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="john.doe@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input 
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 pr-10 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => handlePasswordChange(e.target.value)} 
                placeholder="Create a strong password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l-2.586-.586M6.228 6.228l-2.586-.586m0 0L3.98 8.223m2.268 2.268l2.566 2.566M21 21l-2.228-2.228M21 21l-2.228-2.228m0 0L18.022 15.777M21 21H3m3.228 3.228l-2.686-.686" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Confirm Password</label>
            <div className="relative">
              <input 
                className={`w-full rounded-xl border-2 ${
                  passwordError && confirmPassword 
                    ? 'border-red-500' 
                    : password === confirmPassword && confirmPassword 
                    ? 'border-green-500' 
                    : 'border-gray-300'
                } bg-white px-4 py-3.5 pr-10 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400`}
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => handleConfirmPasswordChange(e.target.value)} 
                placeholder="Confirm your password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-700 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l-2.586-.586M6.228 6.228l-2.586-.586m0 0L3.98 8.223m2.268 2.268l2.566 2.566M21 21l-2.228-2.228M21 21l-2.228-2.228m0 0L18.022 15.777M21 21H3m3.228 3.228l-2.686-.686" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && confirmPassword && (
              <p className="text-red-600 text-sm font-medium">{passwordError}</p>
            )}
            {password === confirmPassword && confirmPassword && !passwordError && (
              <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Passwords match
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading || passwordError !== "" || password !== confirmPassword || password.length < 6}
            className="w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-950 hover:to-indigo-900 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-indigo-950/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10">
          <span className="text-gray-700 font-medium">Already have an account? </span>
          <Link href="/" className="text-indigo-700 hover:text-indigo-900 font-bold transition-colors underline decoration-2 underline-offset-2 hover:decoration-indigo-900">Sign In</Link>
        </div>
      </div>
    </div>
    )
}