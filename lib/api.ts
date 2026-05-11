const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request failed: ${response.status}`);
    }

    return response.json().catch(() => ({}));
}

export const authApi = {
    login: (credentials: any) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (credentials: any) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    changePassword: (data: any) => apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

export const usersApi = {
    getAllUsers: () => apiRequest('/users'),
    createStaff: (userData: any) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    approveUser: (id: number) => apiRequest(`/users/${id}/approve`, { method: 'PUT' }),
    updateRole: (id: number, role: string) => apiRequest(`/users/${id}/role`, { 
        method: 'PUT',
        body: JSON.stringify({ role })
    }),
    deleteUser: (id: number) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

export const staffApi = {
    getAll: () => apiRequest('/users'),
};

export const patientsApi = {
    getAllPatients: () => apiRequest('/patients'),
    registerPatient: (patient: any) => apiRequest('/patients/register', {
        method: 'POST',
        body: JSON.stringify(patient),
    }),
    updatePatient: (id: number, patientUpdates: any) => apiRequest(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patientUpdates),
    }),
};

export const visitsApi = {
    getVisitHistory: (patientId: number) => apiRequest(`/visits/patient/${patientId}`),
    saveVitals: (patientId: number, visitDetails: any) => apiRequest(`/visits/patient/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(visitDetails),
    }),
    getQueuedVisits: (status: string) => apiRequest(`/visits/status/${status}`),
    updateStatus: (id: number, status: string) => apiRequest(`/visits/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(status),
    }),
};

export const recordsApi = {
    saveConsultationNotes: (payload: any) => apiRequest('/medical-records', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    getRecordForVisit: (visitId: number) => apiRequest(`/medical-records/visit/${visitId}`),
    getRecordsByPatient: (patientId: number) => apiRequest(`/medical-records/patient/${patientId}`),
    finalizeDispensing: (visitId: number, notes: string) => apiRequest(`/medical-records/visit/${visitId}/dispense`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
    }),
};

export const analyticsApi = {
    getSummary: () => apiRequest('/analytics/summary'),
    getStaffPerformance: (start: string, end: string) => apiRequest(`/analytics/staff-performance?start=${start}&end=${end}`),
    getRevenueReport: (start: string, end: string) => apiRequest(`/analytics/revenue?start=${start}&end=${end}`),
    getMyActivity: (userId: number, start: string, end: string) => apiRequest(`/analytics/my-activity?userId=${userId}&start=${start}&end=${end}`),
    getDiseaseTrends: () => apiRequest('/analytics/disease-trends'),
    getHandoverTimeline: (visitId: number) => apiRequest(`/analytics/handover-timeline/${visitId}`),
};

export const auditApi = {
    getAll: () => apiRequest('/audit'),
};

export const labApi = {
    requestTest: (visitId: number, data: any) => apiRequest(`/lab/request/${visitId}`, { method: 'POST', body: JSON.stringify(data) }),
    recordResults: (orderId: number, results: string) => apiRequest(`/lab/results/${orderId}`, { method: 'PUT', body: JSON.stringify({ results }) }),
    getByVisit: (visitId: number) => apiRequest(`/lab/visit/${visitId}`),
    getPending: () => apiRequest('/lab/pending'),
};

export const billingApi = {
    createBill: (visitId: number, data: any) => apiRequest(`/billing/create/${visitId}`, { method: 'POST', body: JSON.stringify(data) }),
    addCharge: (visitId: number, category: string, amount: number) => apiRequest(`/billing/add-charge/${visitId}`, { method: 'PUT', body: JSON.stringify({ category, amount }) }),
    payBill: (billId: number) => apiRequest(`/billing/pay/${billId}`, { method: 'PUT' }),
    getUnpaid: () => apiRequest('/billing/unpaid'),
    getByPatient: (patientId: number) => apiRequest(`/billing/patient/${patientId}`),
    getByVisit: (visitId: number) => apiRequest(`/billing/visit/${visitId}`),
};

export const servicesApi = {
    getAll: () => apiRequest('/hospital-services'),
    getByCategory: (cat: string) => apiRequest(`/hospital-services/category/${cat}`),
    save: (data: any) => apiRequest('/hospital-services', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => apiRequest(`/hospital-services/${id}`, { method: 'DELETE' }),
};

export const wardApi = {
    getAll: () => apiRequest('/wards'),
    getAvailableBeds: (wardId: number) => apiRequest(`/wards/${wardId}/available-beds`),
    admit: (data: any) => apiRequest('/wards/admit', { method: 'POST', body: JSON.stringify(data) }),
    discharge: (id: number) => apiRequest(`/wards/discharge/${id}`, { method: 'PUT' }),
};

export const appointmentApi = {
    getByDate: (date: string) => apiRequest(`/appointments/date?date=${date}`),
    schedule: (data: any) => apiRequest('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    checkIn: (id: number) => apiRequest(`/appointments/${id}/check-in`, { method: 'POST' }),
    cancel: (id: number) => apiRequest(`/appointments/${id}`, { method: 'DELETE' }),
};

export const hrApi = {
    getShifts: (date: string) => apiRequest(`/hr/shifts?date=${date}`),
    assignShift: (data: any, admin: string) => apiRequest(`/hr/shifts?admin=${admin}`, { method: 'POST', body: JSON.stringify(data) }),
    generatePayroll: (data: any) => apiRequest('/hr/payroll/generate', { method: 'POST', body: JSON.stringify(data) }),
    pay: (id: number, admin: string) => apiRequest(`/hr/payroll/pay/${id}?admin=${admin}`, { method: 'PUT' }),
};
