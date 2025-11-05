import axios from "axios";
import customerApi from "./api"; // For customer service calls

// Employee Service API endpoints
// Base URL: http://localhost:8070/api (employee service)

// Create a separate axios instance for employee service
const employeeApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_EMPLOYEE_BASE_URL || 'http://localhost:8083/api',
    headers: {
        "Content-Type": "application/json"
    }
});

// Add interceptor to attach JWT token to requests
employeeApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Use employeeApi for all employee service API calls
const api = employeeApi;

export interface AssignmentResponse {
    id: number;
    employeeId: number;
    appointmentId: number;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

export interface TimeLogResponse {
    id: number;
    assignmentId: number;
    startTime: string; // ISO datetime format
    endTime?: string; // ISO datetime format
    note?: string;
}

export interface WorkHoursResponse {
    id: number;
    employeeId: number;
    workDate: string; // ISO date format (YYYY-MM-DD)
    totalSeconds: number;
    logCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// Get all assignments for an employee
export const getEmployeeAssignments = async (employeeId: number): Promise<AssignmentResponse[]> => {
    try {
        const response = await api.get<ApiResponse<AssignmentResponse[]>>(`/assignments/employee/${employeeId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching employee assignments:', error);
        throw error;
    }
};

// Update assignment status
export const updateAssignmentStatus = async (
    assignmentId: number, 
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
): Promise<AssignmentResponse> => {
    try {
        const response = await api.put<ApiResponse<AssignmentResponse>>(
            `/assignments/${assignmentId}/status?status=${status}`
        );
        return response.data.data;
    } catch (error) {
        console.error('Error updating assignment status:', error);
        throw error;
    }
};


// Start time log for an assignment
export const startTimeLog = async (assignmentId: number, note?: string): Promise<TimeLogResponse> => {
    try {
        const params = note ? `?assignmentId=${assignmentId}&note=${encodeURIComponent(note)}` : `?assignmentId=${assignmentId}`;
        const response = await api.post<ApiResponse<TimeLogResponse>>(`/timelogs/start${params}`);
        return response.data.data;
    } catch (error) {
        console.error('Error starting time log:', error);
        throw error;
    }
};

// Stop time log
export const stopTimeLog = async (logId: number): Promise<TimeLogResponse> => {
    try {
        const response = await api.post<ApiResponse<TimeLogResponse>>(`/timelogs/${logId}/stop`);
        return response.data.data;
    } catch (error) {
        console.error('Error stopping time log:', error);
        throw error;
    }
};

// Get time logs for an assignment
export const getTimeLogsForAssignment = async (assignmentId: number): Promise<TimeLogResponse[]> => {
    try {
        const response = await api.get<ApiResponse<TimeLogResponse[]>>(`/timelogs/assignment/${assignmentId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching time logs:', error);
        throw error;
    }
};

// Get work hours for an employee
export const getEmployeeWorkHours = async (employeeId: number): Promise<WorkHoursResponse[]> => {
    try {
        const response = await api.get<ApiResponse<WorkHoursResponse[]>>(`/timelogs/employee/${employeeId}/hours`);
        return response.data.data || [];
    } catch (error: any) {
        // If 404, return empty array (no work hours yet)
        if (error.response?.status === 404) {
            console.warn('Work hours endpoint not found or no data yet. Returning empty array.');
            return [];
        }
        console.error('Error fetching employee work hours:', error);
        // Return empty array on error to prevent dashboard from breaking
        return [];
    }
};

// Get work hours for an employee within a date range
export const getEmployeeWorkHoursRange = async (
    employeeId: number, 
    startDate: string, 
    endDate: string
): Promise<WorkHoursResponse[]> => {
    try {
        const response = await api.get<ApiResponse<WorkHoursResponse[]>>(
            `/timelogs/employee/${employeeId}/hours/range?startDate=${startDate}&endDate=${endDate}`
        );
        return response.data.data;
    } catch (error) {
        console.error('Error fetching employee work hours range:', error);
        throw error;
    }
};

// Get logged-in employee info
export const getLoggedInEmployee = async (email: string): Promise<any> => {
    try {
        const response = await api.get<ApiResponse<any>>(`/employees/me?email=${email}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching employee info:', error);
        throw error;
    }
};

// Fetch appointment details from customer service (needed to get customer, vehicle, service info)
export const getAppointmentDetails = async (appointmentId: number): Promise<any> => {
    try {
    // Call the employee service (BFF) which will fetch /compose appointment details from customer-service
    // This keeps the browser calling only the employee-service.
    const response = await api.get(`/appointments/${appointmentId}`);
    // Log the received appointment details to browser console for debugging
    console.debug(`Fetched appointment ${appointmentId} via Employee Service:`, response.data);
    return response.data;
    } catch (error) {
        console.warn('Customer service not available or appointment not found:', appointmentId, error);
        // Return null instead of throwing - allows graceful degradation
        return null;
    }
};

// Helper function to enrich assignments with appointment details
export const enrichAssignmentsWithDetails = async (
    assignments: AssignmentResponse[]
): Promise<any[]> => {
    try {
        const enriched = await Promise.all(
            assignments.map(async (assignment) => {
                try {
                    const appointmentDetails = await getAppointmentDetails(assignment.appointmentId);
                    
                    // If customer service is not available, use default values
                    if (!appointmentDetails) {
                        return {
                            ...assignment,
                            id: `ASS-${assignment.id}`,
                            assignmentId: assignment.id,
                            appointmentId: assignment.appointmentId,
                            customerName: `Customer (ID: ${assignment.appointmentId})`,
                            vehicle: 'N/A',
                            service: 'N/A',
                            status: assignment.status,
                            assignedDate: new Date().toISOString().split('T')[0],
                            priority: 'Medium',
                            estimatedDuration: 'N/A',
                            appointmentDate: null,
                            appointmentTime: null,
                        };
                    }
                    
                    return {
                        ...assignment,
                        appointmentDetails,
                        // Map to frontend-friendly format
                        id: `ASS-${assignment.id}`,
                        assignmentId: assignment.id, // Backend assignment ID
                        appointmentId: assignment.appointmentId,
                        customerName: appointmentDetails.customer?.firstName 
                            ? `${appointmentDetails.customer.firstName} ${appointmentDetails.customer.lastName || ''}`.trim()
                            : 'Unknown Customer',
                        vehicle: appointmentDetails.vehicle 
                            ? `${appointmentDetails.vehicle.make} ${appointmentDetails.vehicle.model} ${appointmentDetails.vehicle.year || ''}`.trim()
                            : 'Unknown Vehicle',
                        service: appointmentDetails.service?.name || 'Unknown Service',
                        status: assignment.status, // Keep backend status
                        assignedDate: appointmentDetails.appointmentDate || new Date().toISOString().split('T')[0],
                        priority: 'Medium', // Can be added to backend later
                        estimatedDuration: appointmentDetails.estimatedDuration || 'N/A',
                        appointmentDate: appointmentDetails.appointmentDate,
                        appointmentTime: appointmentDetails.appointmentTime,
                    };
                } catch (err) {
                    console.error(`Error processing assignment ${assignment.id}:`, err);
                    return {
                        ...assignment,
                        id: `ASS-${assignment.id}`,
                        assignmentId: assignment.id,
                        appointmentId: assignment.appointmentId,
                        customerName: `Customer (ID: ${assignment.appointmentId})`,
                        vehicle: 'N/A',
                        service: 'N/A',
                        status: assignment.status,
                        assignedDate: new Date().toISOString().split('T')[0],
                        priority: 'Medium',
                        estimatedDuration: 'N/A',
                    };
                }
            })
        );
        return enriched;
    } catch (error) {
        console.error('Error enriching assignments:', error);
        return assignments.map(a => ({
            ...a,
            id: `ASS-${a.id}`,
            assignmentId: a.id,
            appointmentId: a.appointmentId,
            customerName: 'Error loading',
            vehicle: 'Error loading',
            service: 'Error loading',
            status: a.status,
            assignedDate: '',
            priority: 'Medium',
        }));
    }
};

