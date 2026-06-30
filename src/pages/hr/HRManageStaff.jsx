// src/pages/hr/HRManageStaff.jsx
import { useState, useEffect } from "react";
import { getAllEmployees, addNewEmployee, deleteEmployee, updateEmployee } from "../../services/db";

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmDeleteModal({ employeeName, onConfirm, onCancel }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 border border-slate-200" onClick={e => e.stopPropagation()}>
                <h2 className="text-base font-bold text-slate-800 mb-1">Remove employee?</h2>
                <p className="text-sm text-slate-500 mb-5">
                    This will permanently delete <strong className="text-slate-700">{employeeName}</strong> from the system and cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                    <button id="confirm-delete-emp-btn" onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors">Remove</button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Employee Modal ─────────────────────────────────────────────────────
function EditEmployeeModal({ employee, onSave, onClose }) {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [password, setPassword] = useState("");
    const [quota, setQuota] = useState(employee.leaveQuota ?? 15);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.toLowerCase().endsWith("@rtc.com")) {
            setError("Email must use the @rtc.com domain.");
            return;
        }
        const updated = {
            ...employee,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            leaveQuota: parseInt(quota, 10) || 0,
        };
        if (password.trim().length > 0) {
            if (password.trim().length < 6) { setError("Password must be at least 6 characters."); return; }
            updated.password = password.trim();
        }
        await onSave(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 border border-slate-200" onClick={e => e.stopPropagation()}>
                <h2 className="text-base font-bold text-slate-800 mb-1">Edit employee</h2>
                <p className="text-sm text-slate-500 mb-4">Updating details for <strong className="text-slate-700">{employee.name}</strong>.</p>

                {error && (
                    <div className="px-3 py-2 text-sm rounded-lg mb-4 bg-red-50 border border-red-200 text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            New Password <span className="text-slate-400 font-normal normal-case">(leave blank to keep current)</span>
                        </label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Leave Quota (days)</label>
                        <input type="number" required min={0} value={quota} onChange={e => setQuota(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" id="save-edit-emp-btn" className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HRManageStaff() {
    const [staffList, setStaffList] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [quota, setQuota] = useState(15);
    const [formMessage, setFormMessage] = useState({ text: "", isError: false });

    const [searchQuery, setSearchQuery] = useState("");
    const [quotaFilter, setQuotaFilter] = useState("all");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);

    async function loadRoster() {
        const staff = await getAllEmployees();
        setStaffList(staff);
    }

    useEffect(() => { loadRoster(); }, []);

    const filteredStaff = staffList.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const q = emp.leaveQuota ?? 0;
        const matchesQuota =
            quotaFilter === "all"  ? true :
            quotaFilter === "high" ? q >= 10 :
            quotaFilter === "low"  ? q < 10 && q > 0 :
            q === 0;
        return matchesSearch && matchesQuota;
    });

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setFormMessage({ text: "", isError: false });

        if (!email.toLowerCase().endsWith("@rtc.com")) {
            setFormMessage({ text: "Employee email must use the @rtc.com domain.", isError: true });
            return;
        }

        const newStaffProfile = {
            name,
            email: email.toLowerCase().trim(),
            password,
            role: "Employee",
            leaveQuota: parseInt(quota, 10) || 15
        };

        try {
            await addNewEmployee(newStaffProfile);
            setFormMessage({ text: `${name} has been registered successfully.`, isError: false });
            setName(""); setEmail(""); setPassword(""); setQuota(15);
            loadRoster();
        } catch {
            setFormMessage({ text: "An account with this email already exists.", isError: true });
        }
    };

    const handleSaveEdit = async (updatedEmployee) => {
        await updateEmployee(updatedEmployee);
        setEditTarget(null);
        setFormMessage({ text: `${updatedEmployee.name} has been updated.`, isError: false });
        loadRoster();
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        await deleteEmployee(deleteTarget.id);
        setDeleteTarget(null);
        loadRoster();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Add employee form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-1">Add Employee</h3>
                <p className="text-xs text-slate-400 mb-4">Register a new employee account.</p>

                {formMessage.text && (
                    <div className={`px-3 py-2 text-sm rounded-lg mb-4 border ${
                        formMessage.isError
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                        {formMessage.text}
                    </div>
                )}

                <form onSubmit={handleCreateEmployee} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter name"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="username@rtc.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Leave Quota (days)</label>
                        <input type="number" required min={0} value={quota} onChange={e => setQuota(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300" />
                    </div>
                    <button type="submit" id="add-employee-btn"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors mt-1">
                        Add Employee
                    </button>
                </form>
            </div>

            {/* Right: Employee table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Employees</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {filteredStaff.length} of {staffList.length} shown
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="employee-search"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-slate-500 w-48"
                        />
                        <select
                            id="quota-filter"
                            value={quotaFilter}
                            onChange={e => setQuotaFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-slate-500 bg-white"
                        >
                            <option value="all">All quotas</option>
                            <option value="high">10+ days</option>
                            <option value="low">1–9 days</option>
                            <option value="zero">0 days</option>
                        </select>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Quota</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStaff.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{emp.email}</td>
                                    <td className="px-4 py-3 text-center text-slate-600 font-medium text-xs">
                                        {Math.max(0, emp.leaveQuota ?? 0)} days
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => setEditTarget(emp)}
                                                className="px-3 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget({ id: emp.id, name: emp.name })}
                                                className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
                                        {searchQuery || quotaFilter !== "all"
                                            ? "No employees match your search."
                                            : "No employees registered yet."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteTarget && (
                <ConfirmDeleteModal
                    employeeName={deleteTarget.name}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {editTarget && (
                <EditEmployeeModal
                    employee={editTarget}
                    onSave={handleSaveEdit}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </div>
    );
}