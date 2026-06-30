import { useEffect } from "react";

export default function LogoutModal({ onConfirm, onCancel }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-base font-bold text-slate-800 mb-1">Sign out?</h2>
                <p className="text-sm text-slate-500 mb-5">
                    You will be taken back to the login page.
                </p>

                <div className="flex gap-3">
                    <button
                        id="logout-cancel-btn"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        id="logout-confirm-btn"
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
