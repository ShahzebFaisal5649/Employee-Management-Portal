import {useState} from "react";
import {loginUser} from "../../services/db";
import useUserContext from "../../hooks/useUserContext";
import { useNavigate } from "react-router-dom";

export default function Login() 
{
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const {handleLoginSuccess} = useUserContext();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
        const result = await loginUser(email, password);
        if (result.success) {
            // Save user state globally and in localStorage
            handleLoginSuccess(result.user);
            // Automatically redirect users to their correct workspace view based on role
            if (result.user.role === "HR") {
                navigate("/hr/dashboard");
            } else {
                navigate("/employee/dashboard");
            }
        } else {
            setErrorMsg(result.message);
        }
    } catch (error) {
        console.error("Login failed:", error);
        setErrorMsg("Login failed. Please try again.");
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-1">RTC Portal</h2>
                <p className="text-xs text-slate-400 text-center mb-6 uppercase tracking-widest font-semibold">Employee Hub</p>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Enter Email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-[0.99] text-sm tracking-wide shadow-lg shadow-blue-100"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};