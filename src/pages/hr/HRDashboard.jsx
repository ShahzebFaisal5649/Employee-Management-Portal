// src/pages/hr/HRDashboard.jsx
import { useState, useEffect } from "react";
import { getAllEmployees, getCompanyAttendanceToday } from "../../services/db";

export default function HRDashboard() {
    const [staffList, setStaffList] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);

    async function loadDashboardMetrics() {
        const staff = await getAllEmployees();
        const logs = await getCompanyAttendanceToday();
        setStaffList(staff);
        setTodayAttendance(logs);
    }

    useEffect(() => { 
        loadDashboardMetrics(); 
    }, []);

    return (
        <div className="space-y-8">
            {/* KPI Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Strength</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{staffList.length} Registered</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Today</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">{todayAttendance.length} Checked In</h3>
                    </div>
                </div>
            </div>

            {/* Comprehensive Full-Width Attendance Monitor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-md font-bold text-slate-800 mb-4">Today's Attendance Monitor</h3>
                {todayAttendance.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No employee attendance entries recorded for today.</p>
                ) : (
                    <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 uppercase tracking-wider text-slate-400 font-bold border-b">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Clock In</th>
                                    <th className="p-4">Clock Out</th>
                                    <th className="p-4 text-center">Break Logs</th>
                                    <th className="p-4 text-center">Alert Status Indicators</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y font-medium text-slate-700">
                                {todayAttendance.map((log) => {
                                    const hasViolations = log.breakViolation || log.underHoursViolation;

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800">{log.employeeName}</td>
                                            <td className="p-4 font-mono text-blue-600">{log.clockIn}</td>
                                            <td className="p-4 font-mono text-slate-500">
                                                {log.clockOut || (
                                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px] font-bold uppercase">
                                                        On Duty
                                                    </span>
                                                )}
                                            </td>

                                            {/* Break Logs column - now lists every break as start -> end */}
                                            <td className="p-4">
                                                {log.breaks && log.breaks.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {log.breaks.map((b, index) => (
                                                            <div key={index} className="font-mono text-slate-600 text-[11px] text-center">
                                                                {b.start} → {b.end || "Ongoing"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-[11px] text-center">No breaks taken</p>
                                                )}
                                            </td>

                                            <td className="p-4 flex flex-wrap justify-center gap-2">
                                                {log.breakViolation && (
                                                    <span className="bg-red-50 border border-red-200 text-red-600 font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wide shadow-sm">
                                                        ⚠️ EXCEEDED 30M BREAK
                                                    </span>
                                                )}
                                                {log.underHoursViolation && (
                                                    <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wide shadow-sm">
                                                        ⚠️ SHORT SHIFT
                                                        {log.minutesWorked != null
                                                            ? ` (${Math.floor(log.minutesWorked / 60)}h ${log.minutesWorked % 60}m)`
                                                            : ""}
                                                    </span>
                                                )}
                                                {!hasViolations && (
                                                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide">
                                                        ✅ Normal Status
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}