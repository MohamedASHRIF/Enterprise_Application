"use client"

import { useState } from "react"
import api from "../api/api";

export default function Register(){
    const [firstName , setFName] = useState("");
    const [lastName, setLName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhone] = useState("");
    const role = "CUSTOMER";

    const handleRegister = async (e: React.FormEvent)=>{
    e.preventDefault();

    try {
      const res= await api.post('/auth/register', {firstName, lastName,email,password, phoneNumber,  role});
      console.log(res.data);
      alert('Registration Successful!')
      window.location.href='/'
    }
    catch (err){
        console.log(err);
        alert('Regestration Unsuccessful! Please Try Again...');
    }
    
  }
    
    return (
        <div className="md:w-full ms-w-10 h-screen flex justify-center align-middle items-center bg-center bg-cover bg-[url('/Login.png')]" style={{backgroundImage: "url('/Login.png')"}}>
      <div className="bg-white flex flex-col text-black p-16 rounded-lg">
        <h1 className="text-2xl text-center font-bold">Register</h1>
        <form onSubmit={handleRegister}>
            <div className="flex flex-col gap-2">
            <label className="mt-3">First Name :</label>
            <input className="rounded-lg p-2" type="text" value={firstName} onChange={ (e)=>{setFName(e.target.value)}} placeholder="Enter your first name"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Last Name :</label>
            <input className="rounded-lg p-2" type="text" value={lastName} onChange={ (e)=>{setLName(e.target.value)}} placeholder="Enter your last name"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Phone Number :</label>
            <input className="rounded-lg p-2" type="text" value={phoneNumber} onChange={ (e)=>{setPhone(e.target.value)}} placeholder="Enter your phone number"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Email :</label>
            <input className="rounded-lg p-2" type="email" value={email} onChange={ (e)=>{setEmail(e.target.value)}} placeholder="Enter your email"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="mt-3">Password :</label>
            <input className="rounded-lg p-2" type="password" value={password} onChange={ (e)=>{setPassword(e.target.value)}} placeholder="Enter your password"/>
          </div>
          <div className="flex justify-center mt-6">
            <button type="submit" className="bg-[#1E3A8A] rounded-lg px-10 py-2 text-white cursor-pointer hover:bg-[#1249e2]">Register</button>
          </div>
        </form>
        <div className="mt-4">
          <span className="font-medium ">Already have a account ? </span>
          <a className="text-red-500" href="/">Login</a>
        </div>
      </div>
    </div>
    )
}