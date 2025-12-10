"use client"
import { useState } from "react";
import api from "./api/api";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  console.log(email, password);

  const handleLogin = async (e: React.FormEvent)=>{
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res= await api.post('/auth/login', {email:email,password:password});
      console.log('Login response:', res.data);
    
      // Validate response data
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        
        // Safely store user data
        if (res.data.user && typeof res.data.user === 'object') {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          console.log('User data stored:', res.data.user);
        } else {
          console.warn('User data is missing or invalid:', res.data.user);
          // Store at least the email as fallback
          localStorage.setItem('user', JSON.stringify({ 
            email: email, 
            firstName: email.split('@')[0],
            role: 'Customer' 
          }));
        }
        
        // Role-based redirect
        const userRole = res.data.user?.role || res.data.user?.role?.toUpperCase() || 'CUSTOMER';
        let redirectPath = '/Dashboard';
        
        console.log('User role for redirect:', userRole);
        
        switch(userRole.toUpperCase()) {
          case 'ADMIN':
            redirectPath = '/Dashboard/admin/employees';
            console.log('Redirecting to admin dashboard');
            break;
          case 'EMPLOYEE':
            redirectPath = '/Dashboard/employee/assignments';
            console.log('Redirecting to employee dashboard');
            break;
          case 'CUSTOMER':
          default:
            redirectPath = '/Dashboard';
            console.log('Redirecting to customer dashboard');
            break;
        }
        
        console.log('Final redirect path:', redirectPath);
        window.location.href = redirectPath;
      } else {
        throw new Error('Invalid response from server');
      }
    }
    catch (err) {
        console.error('Login error:', err);
        const error = err as { response?: { status?: number; data?: { error?: string } } };
        
        // Check if it's an email verification error (403)
        if (error.response?.status === 403) {
          setErrorMessage('Email not verified! Please check your email and verify your account before logging in.');
        } else if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage('Email or Password is incorrect. Please try again.');
        }
    } finally {
      setIsLoading(false);
    }
    
  }
  return (
    <div className="w-full h-screen flex justify-center items-center bg-center bg-cover bg-[url('/Login.png')]" style={{backgroundImage: "url('/Login.png')"}}>
      <div className="bg-gradient-to-br from-white/98 via-white/96 to-white/98 backdrop-blur-xl flex flex-col w-full max-w-md mx-4 p-10 rounded-3xl shadow-2xl border border-gray-200/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 font-medium">Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl relative z-10">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium text-sm">{errorMessage}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input 
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 pr-10 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
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
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-indigo-700 border-gray-400 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Remember me</span>
            </label>
            <a className="text-indigo-700 hover:text-indigo-900 font-semibold transition-colors hover:underline" href="/forgot-password">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-950 hover:to-indigo-900 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-indigo-950/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10">
          <span className="text-gray-700 font-medium">Don&apos;t have an account? </span>
          <a className="text-indigo-700 hover:text-indigo-900 font-bold transition-colors underline decoration-2 underline-offset-2 hover:decoration-indigo-900" href="/Register">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
