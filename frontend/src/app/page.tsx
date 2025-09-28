"use client"
import Image from "next/image";
import { useState } from "react";
import api from "./api/api";
import { stringify } from "querystring";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log(email, password);

  const handleLogin = async (e: React.FormEvent)=>{
    e.preventDefault();

    try {
      const res= await api.post('/auth/login', {email:email,password:password});
      console.log(res.data);
    
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user' ,JSON.stringify(res.data.user));
      window.location.href='/Dashboard'
    }
    catch (err){
        console.log(err);
        alert('Email or Password is mismatch...');
    }
    
  }
  return (
    <div className="md:w-full ms-w-10 h-screen flex justify-center align-middle items-center bg-center bg-cover bg-[url('/Login.png')]" style={{backgroundImage: "url('/Login.png')"}}>
      <div className="bg-white flex flex-col text-black p-16 rounded-lg">
        <h1 className="text-2xl text-center font-bold">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Email :</label>
            <input className="rounded-lg p-2" type="email" value={email} onChange={ (e)=>{setEmail(e.target.value)}} placeholder="Enter your email"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Password :</label>
            <input className="rounded-lg p-2" type="password" value={password} onChange={ (e)=>{setPassword(e.target.value)}} placeholder="Enter your password"/>
          </div>
          <div className="flex justify-center mt-6">
            <button type="submit" className="bg-[#1E3A8A] rounded-lg px-10 py-2 text-white cursor-pointer hover:bg-[#1249e2]">Login</button>
          </div>
        </form>
        <div className="mt-4 ">
          <span className="font-medium ">Don't have a account ? </span>
          <a className="text-red-500" href="/Register">Register</a><br/>
          <a className="flex justify-center text-blue-300 " href="">Forgot Password</a>
        </div>
      </div>
    </div>
  );
}
