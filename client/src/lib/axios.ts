import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    // Enable sending cookies with cross-origin requests
    withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: () => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Clear auth and redirect to login
const forceLogout = () => {
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
};

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Skip refresh for auth endpoints
            const url = originalRequest.url || '';
            if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue requests while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve: () => resolve(api(originalRequest)), reject });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token API - cookies are sent automatically
                await api.post('/kanban-board/api/v1.0.0/auth/refresh');

                // Process queued requests
                processQueue(null);

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                processQueue(refreshError);
                forceLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
