// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { openDB, seedDefaultHR } from "./services/db";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeLeaves from "./pages/employee/EmployeeLeaves";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

// HR pages
import HRDashboard from "./pages/hr/HRDashboard";
import HRLeaves from "./pages/hr/HRLeaves";
import HRManageStaff from "./pages/hr/HRManageStaff";
import HRAttendanceReports from "./pages/hr/HRAttendanceReports";

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function initializeDB() {
      try {
        await openDB();
        await seedDefaultHR();
        setDbReady(true);
      } catch (e) {
        console.error("DB init failed:", e);
      }
    }
    initializeDB();
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Shell */}
        <Route element={<DashboardLayout />}>
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute allowedRole="Employee"><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/leaves"    element={<ProtectedRoute allowedRole="Employee"><EmployeeLeaves /></ProtectedRoute>} />
          <Route path="/employee/profile"   element={<ProtectedRoute allowedRole="Employee"><EmployeeProfile /></ProtectedRoute>} />

          {/* HR Routes */}
          <Route path="/hr/dashboard"           element={<ProtectedRoute allowedRole="HR"><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/leaves"              element={<ProtectedRoute allowedRole="HR"><HRLeaves /></ProtectedRoute>} />
          <Route path="/hr/manage-staff"        element={<ProtectedRoute allowedRole="HR"><HRManageStaff /></ProtectedRoute>} />
          <Route path="/hr/employees"           element={<ProtectedRoute allowedRole="HR"><HRManageStaff /></ProtectedRoute>} />
          <Route path="/hr/attendance-reports"  element={<ProtectedRoute allowedRole="HR"><HRAttendanceReports /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;