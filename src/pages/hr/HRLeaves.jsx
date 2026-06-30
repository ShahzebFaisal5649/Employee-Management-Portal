// src/pages/hr/HRLeaves.jsx
import  { useState, useEffect } from "react";
import { getAllLeaveRequests, updateLeaveStatus } from "../../services/db";
import useUserContext from "../../hooks/useUserContext";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusClass = (status) => {
    if (status === "Approved") return "text-green-700 bg-green-50 border-green-200";
    if (status === "Rejected") return "text-red-600 bg-red-50 border-red-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
};

export default function HRLeaves() {
    const { refreshCurrentUser } = useUserContext();
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("Pending");

    async function loadAllRequests() {
        const data = await getAllLeaveRequests();
        data.sort((a, b) => b.id - a.id);
        setRequests(data);
    }

    useEffect(() => { loadAllRequests(); }, []);

    const handleAction = async (id, status) => {
        await updateLeaveStatus(id, status);
        await refreshCurrentUser();
        loadAllRequests();
    };

    const filtered = activeTab === "All" ? requests : requests.filter(r => r.status === activeTab);

    const tabCounts = STATUS_TABS.reduce((acc, tab) => {
        acc[tab] = tab === "All" ? requests.length : requests.filter(r => r.status === tab).length;
        return acc;
    }, {});

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-0.5">Leave Operations</h3>
            <p className="text-xs text-slate-400 mb-5">Review and action employee leave requests.</p>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-5">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        id={`leave-tab-${tab.toLowerCase()}`}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                            activeTab === tab
                                ? "border-slate-800 text-slate-800"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {tab}
                        {tabCounts[tab] > 0 && (
                            <span className="ml-1.5 text-xs text-slate-400">({tabCounts[tab]})</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                    No {activeTab.toLowerCase()} leave requests.
                </p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((req) => (
                        <div key={req.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-800 text-sm">{req.employeeName}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusClass(req.status)}`}>
                                        {req.status}
                                    </span>
                                    {req.status === "Pending" && req.exceededQuotaLimit && (
                                        <span className="text-xs text-red-600 font-medium">— over quota</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-0.5">
                                    <span className="font-medium text-slate-400">Reason: </span>{req.reason}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {req.startDate} to {req.endDate}
                                    <span className="ml-1.5 text-slate-500">({req.daysRequested || 1} day{req.daysRequested > 1 ? "s" : ""})</span>
                                </p>
                            </div>

                            {req.status === "Pending" && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAction(req.id, "Approved")}
                                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, "Rejected")}
                                        className="px-4 py-1.5 border border-slate-300 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-50 transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}