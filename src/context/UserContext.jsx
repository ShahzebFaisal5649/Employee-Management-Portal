import { createContext, useState } from "react";
import { openDB } from "../services/db"; 

export const UserContext = createContext(null);

export function UserContextProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("emp_session");
        return saved ? JSON.parse(saved) : null;
    });

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        localStorage.setItem("emp_session", JSON.stringify(user));
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem("emp_session");
    };

    const refreshCurrentUser = async () => {
        if (currentUser) {
            const db = await openDB();
            const transaction = db.transaction("users", "readonly");
            const store = transaction.objectStore("users");
            
            // Fetch the updated record matching the active user's ID
            const request = store.get(currentUser.id);
            request.onsuccess = () => {
                if (request.result) {
                    setCurrentUser(request.result);
                    localStorage.setItem("emp_session", JSON.stringify(request.result));
                }
            };
        }
    };

    const value = {
        currentUser,
        handleLoginSuccess,
        handleLogout,
        refreshCurrentUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;