"use client"

import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("../../components/ChatBot"), { ssr: false });

export default function Dashboard(){
    return(
        <div className="min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard.</p>

            {/* Chatbot widget - client only */}
            <Chatbot />
        </div>
    )

}