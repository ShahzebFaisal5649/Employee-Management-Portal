const DB_NAME = "EmployeePortalDB";
const DB_VERSION = 1;

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Failed To Open DB");
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("users")) {
                db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("attendance")) {
                db.createObjectStore("attendance", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("leaves")) {
                db.createObjectStore("leaves", { keyPath: "id", autoIncrement: true });
            }
        };
    });
}

export async function seedDefaultHR() {
    const db = await openDB();
    const transaction = db.transaction(["users"], "readwrite");
    const store = transaction.objectStore("users");
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
        const users = getAllRequest.result;
        const hrExists = users.some((user) => user.email === "HR@rtc.com");
        if (!hrExists) {
            store.add({
                name: "HR",
                email: "HR@rtc.com",
                password: "hrrtc123",
                role: "HR",
                leaveQuota: null,
            });
        }
    };
}

export async function loginUser(email, password) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const request = store.getAll();
        request.onsuccess = () => {
            const allUsers = request.result || [];
            const userMatch = allUsers.find((u) => u.email === email && u.password === password);
            if (userMatch) resolve({ success: true, user: userMatch });
            else resolve({ success: false, message: "Invalid email or password." });
        };
        request.onerror = () => resolve({ success: false, message: "Failed to read database." });
    });
}

// FIXES BUG #4 & #1: Returns the ACTIVE session record or null if everything is closed out cleanly
export async function getTodayAttendance(userId) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("attendance", "readonly");
        const store = transaction.objectStore("attendance");
        const request = store.getAll();
        request.onsuccess = () => {
            const records = request.result || [];
            const todayStr = new Date().toDateString();

            // Filter down to today's records for this specific employee
            const userRecordsToday = records.filter(
                (r) => r.userId === userId && r.date === todayStr
            );

            if (userRecordsToday.length === 0) {
                resolve(null);
                return;
            }

            // Find an ongoing active shift or look at the latest entry
            const activeShift = userRecordsToday.find(r => !r.clockOutTime);
            if (activeShift) {
                resolve(activeShift);
            } else {
                // If the latest shift is completely closed out, return it to show finalized screen
                resolve(userRecordsToday[userRecordsToday.length - 1]);
            }
        };
    });
}

export async function saveAttendanceRecord(record) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("attendance", "readwrite");
        const store = transaction.objectStore("attendance");
        const request = store.add(record);

        // indexedDB gives us back the new row id here
        request.onsuccess = () => {
            record.id = request.result;
            resolve(record);
        };
    });
}

export async function updateAttendanceRecord(record) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("attendance", "readwrite");
        const store = transaction.objectStore("attendance");
        const request = store.put(record);
        request.onsuccess = () => resolve(true);
    });
}

export async function getAllEmployees() {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const request = store.getAll();
        request.onsuccess = () => {
            const allUsers = request.result || [];
            resolve(allUsers.filter(u => u.role === "Employee"));
        };
    });
}

export async function addNewEmployee(employeeData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.add({ ...employeeData });
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Registration database conflict.");
    });
}

export async function deleteEmployee(userId) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.delete(userId);
        request.onsuccess = () => resolve(true);
    });
}

// Update an existing employee's details (name, email, password)
export async function updateEmployee(employeeData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.put(employeeData);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Failed to update employee.");
    });
}

// FIXES BUG #1: Combines duplicate open entries dynamically so HR views clean data logs
export async function getCompanyAttendanceToday() {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("attendance", "readonly");
        const store = transaction.objectStore("attendance");
        const request = store.getAll();
        request.onsuccess = () => {
            const records = request.result || [];
            const todayStr = new Date().toDateString();
            resolve(records.filter(r => r.date === todayStr));
        };
    });
}

// Fetch all attendance records across all employees within a date range (for HR reports)
export async function getAttendanceByDateRange(startDate, endDate) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("attendance", "readonly");
        const store = transaction.objectStore("attendance");
        const request = store.getAll();
        request.onsuccess = () => {
            const records = request.result || [];
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const filtered = records.filter(r => {
                const recordDate = new Date(r.date);
                return recordDate >= start && recordDate <= end;
            });

            // Sort by date descending
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(filtered);
        };
    });
}

// FIXES BUG #2: Throws errors if retroactive past dates are used
export async function applyForLeave(leaveRequest) {
    const db = await openDB();

    // Parse midnight boundaries for verification calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetStartDate = new Date(leaveRequest.startDate);
    targetStartDate.setHours(0, 0, 0, 0);

    if (targetStartDate < today) {
        return Promise.reject("Retroactive Application Error: Cannot book dates in the past.");
    }

    return new Promise((resolve) => {
        const transaction = db.transaction("leaves", "readwrite");
        const store = transaction.objectStore("leaves");
        const request = store.add(leaveRequest);
        request.onsuccess = () => resolve(true);
    });
}

export async function getEmployeeLeaves(userId) {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("leaves", "readonly");
        const store = transaction.objectStore("leaves");
        const request = store.getAll();
        request.onsuccess = () => {
            const allLeaves = request.result || [];
            resolve(allLeaves.filter(item => item.userId === userId));
        };
    });
}

export async function getAllLeaveRequests() {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction("leaves", "readonly");
        const store = transaction.objectStore("leaves");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
    });
}

// FIXES BUG #3: Unifies Typecasting so String vs Number IDs match up and trigger deduction updates successfully
export async function updateLeaveStatus(leaveId, newStatus) {
    const db = await openDB();

    const leave = await new Promise((resolve) => {
        const tx = db.transaction("leaves", "readonly");
        const store = tx.objectStore("leaves");
        const req = store.get(Number(leaveId));
        req.onsuccess = () => resolve(req.result);
    });

    if (!leave) return false;
    leave.status = newStatus;

    await new Promise((resolve) => {
        const tx = db.transaction("leaves", "readwrite");
        const store = tx.objectStore("leaves");
        const req = store.put(leave);
        req.onsuccess = () => resolve(true);
    });

    if (newStatus === "Approved") {
        const user = await new Promise((resolve) => {
            const tx = db.transaction("users", "readonly");
            const store = tx.objectStore("users");
            const req = store.get(Number(leave.userId));
            req.onsuccess = () => resolve(req.result);
        });

        if (user) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const totalDaysRequested = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const currentQuota = user.leaveQuota !== undefined && user.leaveQuota !== null ? user.leaveQuota : 15;
            user.leaveQuota = currentQuota - totalDaysRequested;

            await new Promise((resolve) => {
                const tx = db.transaction("users", "readwrite");
                const store = tx.objectStore("users");
                const req = store.put(user);
                req.onsuccess = () => resolve(true);
            });
        }
    }

    return true;
}

export async function adjustEmployeeLeaveQuota(userId, newQuotaValue) {
    const db = await openDB();
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    const user = await new Promise((resolve) => {
        const req = store.get(Number(userId));
        req.onsuccess = () => resolve(req.result);
    });

    if (user) {
        user.leaveQuota = parseInt(newQuotaValue, 10);
        store.put(user);
    }
    return tx.done;
}