import { useState, useEffect } from "react";
import useUserContext from "../../hooks/useUserContext";
import { getTodayAttendance, saveAttendanceRecord, updateAttendanceRecord } from "../../services/db";

export default function EmployeeDashboard() {
    const { currentUser } = useUserContext();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");

    // Load today's existing clock state on mount
    useEffect(() => {
        async function checkStatus() {
            if (currentUser) {
                const todayLog = await getTodayAttendance(currentUser.id);
                setRecord(todayLog);

                if (todayLog) {
                    if (todayLog.breakViolation) {
                        setAlertMessage("You have exceeded your 30-minute break limit today! HR has been notified.");
                    } else if (todayLog.underHoursViolation) {
                        setAlertMessage("Notice: You have clocked out having worked less than the required 8 shift hours today.");
                    }
                }
            }
            setLoading(false);
        }
        checkStatus();
    }, [currentUser]);

    const handleClockIn = async () => {
        if (record && !record.clockOut) {
            setAlertMessage("Cannot start a new shift: Please clock out of your active shift first.");
            return;
        }

        const now = new Date();
        const newRecord = {
            userId: currentUser.id,
            employeeName: currentUser.name,
            date: now.toDateString(),
            clockInRaw: Date.now(),
            clockIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clockOut: null,
            clockOutTime: null,
            status: "Present",
            breakViolation: false,
            underHoursViolation: false,
            breaks: []
        };

        const savedRecord = await saveAttendanceRecord(newRecord);

        setRecord(savedRecord);
        setAlertMessage("");
    };

    const handleStartBreak = async () => {
        const now = new Date();
        const updatedRecord = { ...record };

        updatedRecord.breaks.push({
            startRaw: Date.now(),
            start: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            end: null
        });

        await updateAttendanceRecord(updatedRecord);
        setRecord(updatedRecord);
    };

    const handleEndBreak = async () => {
        const now = new Date();
        const updatedRecord = { ...record };

        // Find the active break
        const activeBreak = updatedRecord.breaks.find(b => b.end === null);
        if (activeBreak) {
            activeBreak.end = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            activeBreak.endRaw = Date.now();

            // Calculate break duration in minutes
            const breakDurationMs = Date.now() - activeBreak.startRaw;
            const breakMinutes = Math.floor(breakDurationMs / (1000 * 60));
            activeBreak.durationMinutes = breakMinutes;

            if (breakMinutes > 30) {
                updatedRecord.breakViolation = true;
                setAlertMessage(`You exceeded your break time! You were away for ${breakMinutes} minutes (Max Limit: 30m). HR has been alerted.`);
            }
        }

        await updateAttendanceRecord(updatedRecord);
        setRecord(updatedRecord);
    };

    const handleClockOut = async () => {
        const now = new Date();
        const updatedRecord = { ...record };

        const activeBreak = updatedRecord.breaks.find(b => b.end === null);
        if (activeBreak) {
            activeBreak.end = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            activeBreak.endRaw = Date.now();

            const breakDurationMs = Date.now() - activeBreak.startRaw;
            const minutes = Math.floor(breakDurationMs / (1000 * 60));
            activeBreak.durationMinutes = minutes;

            if (minutes > 30) {
                updatedRecord.breakViolation = true;
            }
        }

        const clockOutStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updatedRecord.clockOut = clockOutStr;
        updatedRecord.clockOutTime = clockOutStr;

        const totalShiftMs = Date.now() - updatedRecord.clockInRaw;
        const totalMinutesWorked = Math.floor(totalShiftMs / (1000 * 60));

        // save the raw minutes, we turn this into "5h 12m" style text when we display it
        updatedRecord.minutesWorked = totalMinutesWorked;

        if (totalMinutesWorked < 8 * 60) {
            updatedRecord.underHoursViolation = true;

            const hoursPart = Math.floor(totalMinutesWorked / 60);
            const minsPart = totalMinutesWorked % 60;
            setAlertMessage(`Notice: You have clocked out having worked only ${hoursPart}h ${minsPart}m today (less than the required 8 shift hours).`);
        }

        await updateAttendanceRecord(updatedRecord);
        setRecord(updatedRecord);
    };

    const handleResetForNewShift = () => {
        setRecord(null);
        setAlertMessage("");
    };

    const isOnBreak = record?.breaks.some(b => b.end === null);

    if (loading) {
        return <p className="text-slate-400 font-medium animate-pulse">Loading</p>;
    }

    return (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Attendance Desk</h2>
            <p className="text-sm text-slate-500 mb-6">Log your daily hours and break shifts here.</p>

            {alertMessage && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-xl transition-all">
                    {alertMessage}
                </div>
            )}

            {!record && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-600 mb-4 font-medium text-sm">You haven't checked in for today's shift yet.</p>
                    <button
                        onClick={handleClockIn}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md shadow-blue-100 text-sm"
                    >
                        Clock In Now
                    </button>
                </div>
            )}

            {record && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Shift Start</span>
                            <p className="text-lg font-bold text-slate-700 mt-0.5">{record.clockIn}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Shift End</span>
                            <p className="text-lg font-bold text-slate-700 mt-0.5">{record.clockOut || "Active"}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Breaks Taken</span>
                            <p className="text-lg font-bold text-slate-700 mt-0.5">{record.breaks.length}</p>
                        </div>
                    </div>

                    {!record.clockOut ? (
                        <div className="flex flex-wrap gap-3 pt-2">
                            {!isOnBreak ? (
                                <button
                                    onClick={handleStartBreak}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm shadow-sm"
                                >
                                    Take a Break
                                </button>
                            ) : (
                                <button
                                    onClick={handleEndBreak}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm shadow-sm"
                                >
                                    Return From Break
                                </button>
                            )}

                            <button
                                onClick={handleClockOut}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm shadow-sm ml-auto"
                            >
                                Complete Shift (Clock Out)
                            </button>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <p className="text-emerald-700 text-sm font-medium">
                                Your work shift has been successfully logged and finalized for today!
                            </p>
                            <button
                                onClick={handleResetForNewShift}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition shrink-0 shadow-sm"
                            >
                                Start New Shift +
                            </button>
                        </div>
                    )}

                    {record.breaks.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Break Log Timeline</h4>
                            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 text-sm">
                                {record.breaks.map((b, index) => (
                                    <div key={index} className="flex justify-between items-center px-4 py-3 border-b border-slate-200/60 last:border-0">
                                        <span className="text-slate-600 font-medium">Break #{index + 1}</span>
                                        <span className="font-mono text-slate-500">
                                            {b.start} &rarr; {b.end || "Ongoing"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}