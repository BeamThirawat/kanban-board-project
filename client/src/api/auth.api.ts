import api from '@/lib/axios';

const BASE_PATH = '/kanban-board/api/v1.0.0/auth';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// New response format - tokens are in HttpOnly cookies
export interface AuthResponse {
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

// Auth API Service
export const authApi = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>(`${BASE_PATH}/login`, data),

    register: (data: RegisterRequest) =>
        api.post<AuthResponse>(`${BASE_PATH}/register`, data),

    logout: () =>
        api.post(`${BASE_PATH}/logout`),

    refresh: () =>
        api.post(`${BASE_PATH}/refresh`),

    getProfile: () =>
        api.get(`${BASE_PATH}/profile`),
};
