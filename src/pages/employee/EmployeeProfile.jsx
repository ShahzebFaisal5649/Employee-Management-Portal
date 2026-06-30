// src/pages/employee/EmployeeProfile.jsx
import { useState } from "react";
import useUserContext from "../../hooks/useUserContext";
import { updateEmployee } from "../../services/db";

export default function EmployeeProfile() {
    const { currentUser, handleLoginSuccess } = useUserContext();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || "");
    const [message, setMessage] = useState({ text: "", isError: false });
    const [saving, setSaving] = useState(false);

    const displayQuota = Math.max(0, currentUser?.leaveQuota ?? 15);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ text: "", isError: false });
        setSaving(true);

        const updated = {
            ...currentUser,
            name: name.trim(),
        };

        await updateEmployee(updated);
        handleLoginSuccess(updated);
        setMessage({ text: "Profile updated successfully.", isError: false });
        setIsEditing(false);
        setSaving(false);
    };

    const handleCancel = () => {
        setName(currentUser?.name || "");
        setMessage({ text: "", isError: false });
        setIsEditing(false);
    };

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
                <p className="text-sm text-slate-500 mt-0.5">View and update your account information.</p>
            </div>

            {message.text && (
                <div className={`px-4 py-3 rounded-lg border text-sm ${
                    message.isError
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-green-50 border-green-200 text-green-700"
                }`}>
                    {message.text}
                </div>
            )}

            {!isEditing ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                    <Row label="Full Name"      value={currentUser?.name} />
                    <Row label="Email"          value={currentUser?.email} />
                    <Row label="Role"           value={currentUser?.role} />
                    <Row label="Leave Quota"    value={`${displayQuota} day${displayQuota !== 1 ? "s" : ""} remaining`} />

                    <div className="px-5 py-4">
                        <button
                            id="edit-profile-btn"
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300"
                        />
                    </div>

                    <p className="text-xs text-slate-400">
                        Email and password can only be changed by HR.
                    </p>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="save-profile-btn"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-36 shrink-0">{label}</span>
            <span className="text-sm text-slate-700 text-right">{value}</span>
        </div>
    );
}
