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
    deleteUser: (id: number) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
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
};

export const recordsApi = {
    saveConsultationNotes: (payload: any) => apiRequest('/medical-records', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
};

export const analyticsApi = {
    getSummary: () => apiRequest('/analytics/summary'),
    getStaffPerformance: () => apiRequest('/analytics/staff-performance'),
};
