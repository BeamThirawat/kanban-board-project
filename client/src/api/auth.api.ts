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

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export interface RegisterResponse {
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
        api.post<LoginResponse>(`${BASE_PATH}/login`, data),

    register: (data: RegisterRequest) =>
        api.post<RegisterResponse>(`${BASE_PATH}/register`, data),

    logout: () =>
        api.post(`${BASE_PATH}/logout`),

    refreshToken: (refreshToken: string) =>
        api.post<{ accessToken: string }>(`${BASE_PATH}/refresh`, { refreshToken }),
};
