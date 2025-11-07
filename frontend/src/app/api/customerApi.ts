import axios from 'axios';

// Customer Service API client
// Default base URL: http://localhost:8085/api (customer-service)
const customerApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_CUSTOMER_API_BASE || 'http://localhost:8085/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT token from localStorage to requests
customerApi.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
            // Basic sanity checks: only attach a token that looks like a JWT (contains two dots)
            // This prevents sending placeholders like "<TOKEN>" or empty values which will cause
            // the server JWT parser to reject the request with 401.
            if (token && typeof token === 'string') {
                const dotCount = (token.match(/\./g) || []).length;
                const lowered = token.trim();
                const isPlaceholder = lowered.startsWith('<') && lowered.endsWith('>');
                const isNullLiteral = lowered === 'null' || lowered === 'undefined';
                if (!isPlaceholder && !isNullLiteral && dotCount === 2) {
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${token}`;
                } else {
                    // do not attach malformed token
                    console.warn('customerApi: token in localStorage appears invalid — not attaching Authorization header');
                }
            }
        } catch (e) {
            // ignore (running in SSR or no localStorage)
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    message?: string;
}

// Appointments
export const bookAppointment = async (payload: any) => {
    try {
        // POST /appointments/book
        const res = await customerApi.post<ApiResponse<any>>('/appointments/book', payload);
        return res.data;
    } catch (err) {
        // Provide more actionable logging for 4xx/5xx responses
        // Axios errors have a `response` object with status and data
        // Re-throw an enriched error so callers (pages) can inspect `.response`
        console.error('bookAppointment error', err);
        if ((err as any).response) {
            console.error('Response status:', (err as any).response.status);
            console.error('Response data:', (err as any).response.data);
        } else if ((err as any).request) {
            console.error('No response received, request:', (err as any).request);
        } else {
            console.error('Error message:', (err as any).message || err);
        }
        throw err;
    }
};

export const getAppointmentsByCustomer = async (customerId: number) => {
    try {
        const res = await customerApi.get<ApiResponse<any[]>>(`/appointments/customer/${customerId}`);
        return res.data?.data || [];
    } catch (err) {
        console.error('getAppointmentsByCustomer error', err);
        return [];
    }
};

export const getAppointmentById = async (id: number) => {
    try {
        const res = await customerApi.get<ApiResponse<any>>(`/appointments/${id}`);
        return res.data?.data || res.data;
    } catch (err) {
        console.error('getAppointmentById error', err);
        return null;
    }
};

export const getAppointmentPublicById = async (id: number) => {
    try {
        // Public composed DTO (customer-service exposes /api/public/appointments/{id})
        const res = await customerApi.get(`/public/appointments/${id}`);
        return res.data;
    } catch (err) {
        console.warn('getAppointmentPublicById warning', err);
        return null;
    }
};

export const updateAppointmentStatus = async (id: number, status: string) => {
    try {
        // PUT /appointments/{id}/status?status=...
        const res = await customerApi.put<ApiResponse<any>>(`/appointments/${id}/status?status=${encodeURIComponent(status)}`);
        return res.data?.data || res.data;
    } catch (err) {
        console.error('updateAppointmentStatus error', err);
        throw err;
    }
};

export const cancelAppointment = async (id: number) => {
    return updateAppointmentStatus(id, 'CANCELLED');
};

export const getUpcomingAppointments = async (limit = 10) => {
    try {
        const res = await customerApi.get<ApiResponse<any[]>>(`/appointments/upcoming?limit=${limit}`);
        return res.data?.data || [];
    } catch (err) {
        console.error('getUpcomingAppointments error', err);
        return [];
    }
};

export const getAppointmentStats = async () => {
    try {
        const res = await customerApi.get<ApiResponse<any>>('/appointments/stats');
        return res.data?.data || {};
    } catch (err) {
        console.error('getAppointmentStats error', err);
        return {};
    }
};

// Vehicles
export const getVehicles = async (customerId?: number) => {
    try {
        const url = customerId ? `/vehicles/customer/${customerId}` : '/vehicles';
        const res = await customerApi.get<any>(url);
        // Support two response shapes:
        // 1) ApiResponse<T> -> { success?, data?: T, message? }
        // 2) raw array -> [ { ...vehicle }, ... ]
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
        return [];
    } catch (err) {
        console.error('getVehicles error', err);
        return [];
    }
};

export const addVehicle = async (vehicle: any) => {
    try {
        const res = await customerApi.post<ApiResponse<any>>('/vehicles', vehicle);
        return res.data;
    } catch (err) {
        console.error('addVehicle error', err);
        throw err;
    }
};

export const deleteVehicle = async (id: number) => {
    try {
        const res = await customerApi.delete<ApiResponse<any>>(`/vehicles/${id}`);
        return res.data;
    } catch (err) {
        console.error('deleteVehicle error', err);
        throw err;
    }
};

// Services
export const getServices = async () => {
    try {
        const res = await customerApi.get<ApiResponse<any[]>>('/services');
        return res.data?.data || [];
    } catch (err) {
        console.error('getServices error', err);
        return [];
    }
};

// Profile
export const getProfile = async () => {
    try {
        const res = await customerApi.get<ApiResponse<any>>('/profile');
        return res.data?.data || res.data;
    } catch (err) {
        console.error('getProfile error', err);
        return null;
    }
};

export const updateProfile = async (payload: any) => {
    try {
        const res = await customerApi.put<ApiResponse<any>>('/profile', payload);
        return res.data?.data || res.data;
    } catch (err) {
        console.error('updateProfile error', err);
        throw err;
    }
};

export default customerApi;
