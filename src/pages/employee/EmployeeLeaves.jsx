// src/pages/employee/EmployeeLeaves.jsx
import { useState, useEffect } from "react";
import useUserContext from "../../hooks/useUserContext";
import { applyForLeave, getEmployeeLeaves } from "../../services/db";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusClass = (status) => {
    if (status === "Approved") return "text-green-700 bg-green-50 border-green-200";
    if (status === "Rejected") return "text-red-600 bg-red-50 border-red-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
};

export default function EmployeeLeaves() {
    const { currentUser } = useUserContext();
    const [history, setHistory] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [msg, setMsg] = useState({ text: "", isError: false });
    const [warningMsg, setWarningMsg] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const todayString = new Date().toISOString().split("T")[0];

    async function loadLeaves() {
        if (currentUser) {
            const data = await getEmployeeLeaves(currentUser.id);
            data.sort((a, b) => b.id - a.id);
            setHistory(data);
        }
    }

    useEffect(() => { loadLeaves(); }, [currentUser]);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const currentQuota = Math.max(0, currentUser?.leaveQuota ?? 15);
            if (requestedDays > currentQuota) {
                setWarningMsg(`You are requesting ${requestedDays} days but only have ${currentQuota} remaining. HR will be notified.`);
            } else {
                setWarningMsg("");
            }
        } else {
            setWarningMsg("");
        }
    }, [startDate, endDate, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: "", isError: false });

        const start = new Date(startDate);
        const end = new Date(endDate);
        const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const currentQuota = Math.max(0, currentUser?.leaveQuota ?? 15);

        const request = {
            userId: currentUser.id,
            employeeName: currentUser.name,
            startDate,
            endDate,
            reason,
            daysRequested: requestedDays,
            status: "Pending",
            exceededQuotaLimit: requestedDays > currentQuota,
        };

        try {
            await applyForLeave(request);
            setMsg({ text: "Leave request submitted.", isError: false });
            setStartDate(""); setEndDate(""); setReason(""); setWarningMsg("");
            loadLeaves();
        } catch (err) {
            setMsg({ text: String(err), isError: true });
        }
    };

    const filtered = activeTab === "All" ? history : history.filter(item => item.status === activeTab);
    const tabCounts = STATUS_TABS.reduce((acc, tab) => {
        acc[tab] = tab === "All" ? history.length : history.filter(i => i.status === tab).length;
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-0.5">Request Leave</h3>
                <p className="text-xs text-slate-400 mb-4">Select your dates and submit a request.</p>

                {warningMsg && (
                    <div className="px-3 py-2 text-sm rounded-lg mb-3 bg-amber-50 border border-amber-200 text-amber-700">
                        {warningMsg}
                    </div>
                )}
                {msg.text && (
                    <div className={`px-3 py-2 text-sm rounded-lg mb-3 border ${
                        msg.isError
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            min={todayString}
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setEndDate(""); }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                        <input
                            type="date"
                            required
                            disabled={!startDate}
                            min={startDate}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason</label>
                        <textarea
                            required
                            rows="3"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Annual family vacation"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        id="submit-leave-btn"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                        Submit Request
                    </button>
                </form>
            </div>

            {/* Leave history */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <h3 className="text-base font-bold text-slate-800 mb-4">Leave History</h3>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-4">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            id={`emp-leave-tab-${tab.toLowerCase()}`}
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
                    <div className="space-y-2">
                        {filtered.map((item) => (
                            <div key={item.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800">{item.reason}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {item.startDate} to {item.endDate}
                                        <span className="ml-1.5">({item.daysRequested || 1} day{item.daysRequested > 1 ? "s" : ""})</span>
                                    </p>
                                    {item.exceededQuotaLimit && (
                                        <p className="text-xs text-red-500 mt-0.5">Over quota — flagged for HR review</p>
                                    )}
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${statusClass(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}