import { Navigate } from "react-router-dom";
import useUserContext from "../hooks/useUserContext";

export default function ProtectedRoute({ children, allowedRole }) {
    const { currentUser } = useUserContext();

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }
    if (allowedRole && currentUser.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }
    return children;
}
