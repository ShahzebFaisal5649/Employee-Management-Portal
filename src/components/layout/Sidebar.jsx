import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, label }) => {
    const { pathname } = useLocation();
    const isActive = pathname === to;

    return (
        <Link
            to={to}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
            {label}
        </Link>
    );
};

export default function Sidebar({ currentUser, onSignOut }) {
    const displayQuota = Math.max(0, currentUser?.leaveQuota ?? 15);

    return (
        <div className="w-60 bg-slate-900 text-slate-200 flex flex-col justify-between h-full shrink-0">
            <div className="p-5">
                <div className="mb-7 pb-5 border-b border-slate-800">
                    <p className="text-white font-bold text-sm">RTC Employee Portal</p>
                </div>

                <nav className="space-y-1">
                    {currentUser?.role === "HR" ? (
                        <>
                            <p className="text-[10px] uppercase font-semibold text-slate-600 tracking-widest px-3 mb-2">HR Panel</p>
                            <NavLink to="/hr/dashboard"          label="Dashboard" />
                            <NavLink to="/hr/manage-staff"       label="Manage Staff" />
                            <NavLink to="/hr/leaves"             label="Leave Operations" />
                            <NavLink to="/hr/attendance-reports" label="Attendance Reports" />
                        </>
                    ) : (
                        <>
                            <p className="text-[10px] uppercase font-semibold text-slate-600 tracking-widest px-3 mb-2">Employee Panel</p>
                            <NavLink to="/employee/dashboard" label="Attendance Desk" />
                            <NavLink to="/employee/leaves"    label="Leave Planner" />
                            <NavLink to="/employee/profile"   label="My Profile" />
                        </>
                    )}
                </nav>
            </div>

            <div className="p-5 border-t border-slate-800">
                <div className="mb-3">
                    <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser?.role}</p>
                    {currentUser?.role === "Employee" && (
                        <p className="text-xs text-slate-400 mt-1">{displayQuota} leave days remaining</p>
                    )}
                </div>
                <button
                    id="sidebar-logout-btn"
                    onClick={onSignOut}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}