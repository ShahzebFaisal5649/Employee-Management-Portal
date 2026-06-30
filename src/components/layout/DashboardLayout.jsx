import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import useUserContext from "../../hooks/useUserContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LogoutModal from "../LogoutModal";
import NotificationBanner from "../NotificationBanner";
import { getAllLeaveRequests, getEmployeeLeaves } from "../../services/db";

export default function DashboardLayout() {
    const { currentUser, handleLogout } = useUserContext();
    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    useEffect(() => {
        if (!currentUser) return;

        async function loadNotifications() {
            const msgs = [];

            if (currentUser.role === "HR") {
                const all = await getAllLeaveRequests();
                const pendingCount = all.filter(r => r.status === "Pending").length;
                if (pendingCount > 0) {
                    msgs.push({
                        id: "pending-leaves",
                        text: `${pendingCount} leave request${pendingCount > 1 ? "s" : ""} pending your approval.`,
                        type: "warning",
                    });
                }
            } else {
                const myLeaves = await getEmployeeLeaves(currentUser.id);
                const recentApproved = myLeaves.filter(l => l.status === "Approved").length;
                const recentRejected = myLeaves.filter(l => l.status === "Rejected").length;
                if (recentApproved > 0) {
                    msgs.push({
                        id: "approved-leaves",
                        text: `${recentApproved} of your leave request${recentApproved > 1 ? "s have" : " has"} been approved.`,
                        type: "success",
                    });
                }
                if (recentRejected > 0) {
                    msgs.push({
                        id: "rejected-leaves",
                        text: `${recentRejected} leave request${recentRejected > 1 ? "s were" : " was"} declined by HR.`,
                        type: "info",
                    });
                }
            }

            setNotifications(msgs);
        }

        loadNotifications();
    }, [currentUser]);

    const handleDismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleConfirmLogout = () => {
        handleLogout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar
                currentUser={currentUser}
                onSignOut={() => setShowLogoutModal(true)}
            />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Header role={currentUser?.role} />
                <main className="p-8 max-w-7xl w-full mx-auto">
                    <NotificationBanner
                        messages={notifications}
                        onDismiss={handleDismissNotification}
                    />
                    <Outlet />
                </main>
            </div>

            {showLogoutModal && (
                <LogoutModal
                    onConfirm={handleConfirmLogout}
                    onCancel={() => setShowLogoutModal(false)}
                />
            )}
        </div>
    );
}