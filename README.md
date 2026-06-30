# 🏢 Employee Management Portal

A full-featured, browser-based Employee Management Portal built with **React 19**, **Vite**, **Tailwind CSS v4**, and **IndexedDB** — requiring zero backend setup. The app provides separate role-based experiences for **HR Managers** and **Employees**.

---

## 🚀 Live Demo

> 🎬 A demo video (`Employee Management Portal Demo.mp4`) is included in the root of the repository showcasing all major features in action.

---

## ✨ Features

### 👔 HR Module
| Feature | Description |
|---|---|
| **HR Dashboard** | Overview of all employees, pending leaves, and today's attendance stats |
| **Manage Staff** | Add, edit, and delete employees; assign and adjust leave quotas |
| **Leave Management** | View, approve, or reject employee leave requests with real-time quota deduction |
| **Attendance Reports** | Filter and view attendance records by employee or date range |

### 👤 Employee Module
| Feature | Description |
|---|---|
| **Employee Dashboard** | Clock in / Clock out with live timer, today's attendance summary |
| **Leave Application** | Apply for leaves with date picker; view status of all past requests |
| **Profile** | View personal profile details and remaining leave quota |

### 🔐 Authentication & Access Control
- Role-based login (`HR` and `Employee` roles)
- Protected routes — unauthorized access redirects to login
- Persistent session via `localStorage` + React Context

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router DOM v7 |
| **Database** | IndexedDB (browser-native, via custom `db.js` service) |
| **Linting** | ESLint 10 with React Hooks & React Refresh plugins |

> **No backend, no database server, no cloud service required.** All data is stored locally in the browser's IndexedDB.

---

## 📁 Project Structure

```
employee-management-portal/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx   # Shared shell with sidebar & header
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── LogoutModal.jsx
│   │   └── NotificationBanner.jsx
│   ├── context/
│   │   └── UserContext.jsx           # Auth state via React Context API
│   ├── hooks/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── employee/
│   │   │   ├── EmployeeDashboard.jsx # Clock-in/out, live timer
│   │   │   ├── EmployeeLeaves.jsx    # Leave application & history
│   │   │   └── EmployeeProfile.jsx
│   │   └── hr/
│   │       ├── HRDashboard.jsx
│   │       ├── HRManageStaff.jsx     # Full CRUD for employees
│   │       ├── HRLeaves.jsx          # Approve / Reject leaves
│   │       └── HRAttendanceReports.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx        # Role-based route guard
│   ├── services/
│   │   └── db.js                     # All IndexedDB CRUD operations
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/ShahzebFaisal5649/Employee-Management-Portal.git
cd Employee-Management-Portal

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Default Login Credentials

On first run, the app auto-seeds a default HR account into IndexedDB:

| Role | Email | Password |
|---|---|---|
| **HR Manager** | `HR@rtc.com` | `hrrtc123` |
| **Employee** | *(Created by HR)* | *(Set by HR)* |

> **To create an Employee account**, log in as HR → go to **Manage Staff** → click **Add Employee**.

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server with HMR
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## 🗄️ Data Persistence

All data is stored in the browser's **IndexedDB** under the database name `EmployeePortalDB`. The schema includes three object stores:

- **`users`** — Employee and HR accounts with leave quota
- **`attendance`** — Clock-in/clock-out records per user per day
- **`leaves`** — Leave requests with status (`Pending` / `Approved` / `Rejected`)

> ⚠️ Data is local to the browser. Clearing browser data / site data will reset the app.

---

## 🧩 Key Implementation Highlights

- **Zero-backend architecture** — Fully functional offline-first app using only browser APIs
- **Role-based access** — `ProtectedRoute` wraps every page with role verification
- **Live attendance timer** — Real-time clock-in duration displayed on the Employee Dashboard
- **Leave quota deduction** — Automatically deducted from the employee's balance when HR approves a request
- **Retroactive leave prevention** — The `applyForLeave` function rejects any start date in the past
- **Clean HR attendance view** — Duplicate open-shift entries are handled gracefully for HR reports

---

## 📸 Screenshots & Demo

A full demo video is included in the repository root:
**`Employee Management Portal Demo.mp4`**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Shahzeb Faisal**
- GitHub: [@ShahzebFaisal5649](https://github.com/ShahzebFaisal5649)
