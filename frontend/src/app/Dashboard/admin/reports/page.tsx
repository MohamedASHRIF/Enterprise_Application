"use client"
import Navbar from "@/components/Navbar";
import PieChart from "@/components/charts/PieChart";
import { useMemo } from "react";

export default function AdminReportsPage() {
    // Mock metrics - replace with backend integration
    // Backend Integration: GET /api/admin/reports/summary
    const customersTotal = 1240;
    const totalIncome = 158430.75;
    const totalExpenditures = 93450.2;
    const totalClockInMinutes = 48230; // sum of employee clock-ins

    const clockInHrs = Math.floor(totalClockInMinutes / 60);
    const clockInMins = totalClockInMinutes % 60;

    // Backend Integration: GET /api/admin/reports/revenue-breakdown
    const pieData = useMemo(() => ([
        { label: "Labor", value: 64000, color: "#06b6d4" },
        { label: "Parts", value: 52000, color: "#3b82f6" },
        { label: "Services", value: 31430.75, color: "#8b5cf6" }
    ]), []);

    // Backend Integration: GET /api/admin/reports/expenditure-breakdown
    const expenditureData = useMemo(() => ([
        { label: "Salaries", value: 54000, color: "#f59e0b" },
        { label: "Rent", value: 18000, color: "#ef4444" },
        { label: "Utilities", value: 9500, color: "#22c55e" },
        { label: "Supplies", value: 11950.2, color: "#eab308" }
    ]), []);

    // Backend Integration: GET /api/admin/reports/appointment-status-breakdown
    const appointmentStatusData = useMemo(() => ([
        { label: "Scheduled", value: 42, color: "#60a5fa" },
        { label: "In Progress", value: 17, color: "#f59e0b" },
        { label: "Completed", value: 126, color: "#10b981" },
        { label: "Cancelled", value: 9, color: "#ef4444" }
    ]), []);

    // Backend Integration: GET /api/admin/reports/customer-segments
    const customerSegmentsData = useMemo(() => ([
        { label: "New", value: 280, color: "#a78bfa" },
        { label: "Returning", value: 720, color: "#22d3ee" },
        { label: "VIP", value: 60, color: "#f472b6" }
    ]), []);

    const handleDownloadReport = () => {
        const csvRows: string[] = [];
        const esc = (v: unknown) => String(v ?? "").replace(/"/g, '""');

        // Summary
        csvRows.push("Section,Metric,Value");
        csvRows.push(`Summary,Total Customers,${customersTotal}`);
        csvRows.push(`Summary,Total Income,$${totalIncome.toFixed(2)}`);
        csvRows.push(`Summary,Total Expenditures,$${totalExpenditures.toFixed(2)}`);
        csvRows.push(`Summary,Total Clock-In,${clockInHrs}h ${clockInMins}m`);

        // Revenue Breakdown
        csvRows.push("");
        csvRows.push("Revenue Breakdown,Category,Amount");
        pieData.forEach(d => {
            csvRows.push(`Revenue Breakdown,${esc(d.label)},$${Number(d.value).toFixed(2)}`);
        });

        // Expenditure Breakdown
        csvRows.push("");
        csvRows.push("Expenditure Breakdown,Category,Amount");
        expenditureData.forEach(d => {
            csvRows.push(`Expenditure Breakdown,${esc(d.label)},$${Number(d.value).toFixed(2)}`);
        });

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admin-report-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Reports</h1>
                        <p className="text-gray-400">Business KPIs and performance analytics</p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12 12 16.5m0 0 4.5-4.5M12 16.5V3" />
                        </svg>
                        Download Report
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Customers</p>
                                <p className="text-white text-2xl font-bold mt-1">{customersTotal.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Income</p>
                                <p className="text-white text-2xl font-bold mt-1">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-9h6m-9 9h12a3 3 0 003-3V9a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Expenditures</p>
                                <p className="text-white text-2xl font-bold mt-1">${totalExpenditures.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h10M6 19h12M6 5h12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Employees Total Clock-In Time</p>
                                <p className="text-white text-2xl font-bold mt-1">{clockInHrs}h {clockInMins}m</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts + Legends */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Revenue */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-white text-lg font-semibold mb-6">Revenue Breakdown</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-1 flex items-center justify-center">
                                <PieChart data={pieData} size={260} thickness={36} centerLabel={`$${totalIncome.toLocaleString()}`} />
                            </div>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    {pieData.map((d) => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                                                <span className="text-gray-300">{d.label}</span>
                                            </div>
                                            <div className="text-white font-medium">${d.value.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expenditures */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-white text-lg font-semibold mb-6">Expenditure Breakdown</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-1 flex items-center justify-center">
                                <PieChart data={expenditureData} size={260} thickness={36} centerLabel={`$${totalExpenditures.toLocaleString()}`} />
                            </div>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    {expenditureData.map((d) => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                                                <span className="text-gray-300">{d.label}</span>
                                            </div>
                                            <div className="text-white font-medium">${d.value.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Charts */}
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Appointments Status */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-white text-lg font-semibold mb-6">Appointments Status</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-1 flex items-center justify-center">
                                <PieChart data={appointmentStatusData} size={260} thickness={36} centerLabel={`${appointmentStatusData.reduce((s, d) => s + d.value, 0).toLocaleString()}`} />
                            </div>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    {appointmentStatusData.map((d) => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                                                <span className="text-gray-300">{d.label}</span>
                                            </div>
                                            <div className="text-white font-medium">{d.value.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Segments */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-white text-lg font-semibold mb-6">Customer Segments</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-1 flex items-center justify-center">
                                <PieChart data={customerSegmentsData} size={260} thickness={36} centerLabel={`${customerSegmentsData.reduce((s, d) => s + d.value, 0).toLocaleString()}`} />
                            </div>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    {customerSegmentsData.map((d) => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                                                <span className="text-gray-300">{d.label}</span>
                                            </div>
                                            <div className="text-white font-medium">{d.value.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


