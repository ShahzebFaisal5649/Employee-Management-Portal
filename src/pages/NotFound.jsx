// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="text-center max-w-sm">
                <span className="text-6xl"></span>
                <h2 className="text-2xl font-black text-slate-800 mt-4 mb-1">Page Not Found</h2>
                <p className="text-sm text-slate-400 mb-6">The workstation route you are looking for does not exist or has been shifted.</p>
                <button 
                    onClick={() => navigate("/")}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                >
                    Return to Portal
                </button>
            </div>
        </div>
    );
}