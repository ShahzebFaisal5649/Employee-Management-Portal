// src/pages/hr/HRAttendanceReports.jsx
import  { useState } from "react";
import { getAttendanceByDateRange } from "../../services/db";

function formatMinutes(minutes) {
    if (minutes == null) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

export default function HRAttendanceReports() {
    const todayStr = new Date().toISOString().split("T")[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [records, setRecords] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = await getAttendanceByDateRange(startDate, endDate);
        setRecords(data);
        setLoaded(true);
        setLoading(false);
    };

    const totalShifts = records.length;
    const uniqueEmployees = new Set(records.map(r => r.userId)).size;
    const violations = records.filter(r => r.breakViolation || r.underHoursViolation).length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Attendance Reports</h2>
                <p className="text-sm text-slate-500 mt-0.5">View employee attendance logs for a selected date range.</p>
            </div>

            {/* Date range form */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">From</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setEndDate(e.target.value); }}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">To</label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            min={startDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        id="attendance-report-search-btn"
                        disabled={loading}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Generate Report"}
                    </button>
                </form>
            </div>

            {/* Summary row */}
            {loaded && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total Shifts",         value: totalShifts },
                        { label: "Employees",            value: uniqueEmployees },
                        { label: "Shifts with Violations", value: violations },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-400 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Records table */}
            {loaded && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                        {startDate === endDate ? startDate : `${startDate} to ${endDate}`}
                    </h3>

                    {records.length === 0 ? (
                        <p className="text-sm text-slate-400 py-8 text-center">No attendance records found for this date range.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="border-b border-slate-200">
                                    <tr>
                                        {["Employee", "Date", "Clock In", "Clock Out", "Hours", "Notes"].map(h => (
                                            <th key={h} className="px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.map((log) => {
                                        const notes = [];
                                        if (!log.clockOut)           notes.push("In progress");
                                        if (log.breakViolation)      notes.push("Break exceeded");
                                        if (log.underHoursViolation) notes.push("Short shift");
                                        if (!notes.length && log.clockOut) notes.push("Normal");

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-3 font-medium text-slate-800">{log.employeeName}</td>
                                                <td className="px-3 py-3 text-slate-500 text-xs">{log.date}</td>
                                                <td className="px-3 py-3 text-slate-600">{log.clockIn}</td>
                                                <td className="px-3 py-3 text-slate-500">{log.clockOut || "—"}</td>
                                                <td className="px-3 py-3 text-slate-600">
                                                    {log.minutesWorked != null ? formatMinutes(log.minutesWorked) : "—"}
                                                </td>
                                                <td className="px-3 py-3 text-xs text-slate-500">
                                                    {notes.join(", ")}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
