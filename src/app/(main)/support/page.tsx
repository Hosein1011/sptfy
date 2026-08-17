"use client";

import React, { useState } from "react";
import {
    MessageSquare, UserCheck, AlertCircle,
    Search, Filter, CheckCircle2, Clock,
    MoreVertical, ShieldCheck, BarChart3
} from "lucide-react";

// Sample data for dashboard display
const MOCK_TICKETS = [
    { id: "TK-101", user: "Armin Alavi", subject: "Subscription payment issue", status: "Open", priority: "High", date: "2024-07-05" },
    { id: "TK-102", user: "Sara Mohammadi", subject: "Audio playback issue", status: "Pending", priority: "Medium", date: "2024-07-06" },
    { id: "TK-103", user: "Reza Rezaei", subject: "Refund request", status: "Closed", priority: "Low", date: "2024-07-04" },
];

export default function SupportDashboard() {
    const [activeTab, setActiveTab] = useState("tickets");

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Support Dashboard</h1>
                    <p className="text-melora-textSecondary">Manage tickets and monitor user activity</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-melora-purple/10 hover:bg-melora-purple/20 text-melora-purple px-4 py-2 rounded-xl border border-melora-purple/20 transition-all">
                        <BarChart3 className="w-4 h-4" />
                        Reports
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard icon={<MessageSquare />} title="Open Tickets" value="12" color="text-melora-purple" />
                <StatCard icon={<AlertCircle />} title="High Priority" value="3" color="text-melora-pink" />
                <StatCard icon={<UserCheck />} title="Online Users" value="1,240" color="text-green-400" />
                <StatCard icon={<ShieldCheck />} title="Reports" value="5" color="text-yellow-400" />
            </div>

            {/* Main Content Area */}
            <div className="bg-melora-surfaceLayer/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-soft">
                {/* Table Controls */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-melora-textMuted" />
                        <input
                            type="text"
                            placeholder="Search tickets or username..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-melora-purple/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-melora-textMuted">Status Filter:</span>
                        <select className="bg-white/5 border border-white/10 rounded-lg py-1 px-3 text-white outline-none focus:border-melora-purple/50">
                            <option value="all">All</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-melora-textSecondary text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_TICKETS.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-melora-textMuted">{ticket.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-white font-medium">{ticket.user}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-melora-textSecondary">{ticket.subject}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={ticket.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-melora-textMuted">{ticket.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-melora-textMuted hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) {
    return (
        <div className="bg-melora-surfaceLayer/40 border border-white/5 p-6 rounded-2xl shadow-soft group hover:border-melora-purple/30 transition-all">
            <div className={`mb-4 ${color}`}>{icon}</div>
            <p className="text-melora-textSecondary text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Open: "bg-melora-purple/10 text-melora-purple border-melora-purple/20",
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Closed: "bg-white/5 text-melora-textMuted border-white/10",
    };

    const icons: Record<string, React.ReactNode> = {
        Open: <Clock className="w-3 h-3" />,
        Pending: <AlertCircle className="w-3 h-3" />,
        Closed: <CheckCircle2 className="w-3 h-3" />,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            {icons[status]}
            {status === "Open" ? "Open" : status === "Pending" ? "Pending" : "Closed"}
        </span>
    );
}
