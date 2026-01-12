import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Clear tokens and redirect to login
const forceLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
};

// Request interceptor to attach Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                forceLogout();
                return Promise.reject(error);
            }

            try {
                // Call refresh token API with refreshToken in Authorization header
                // Backend expects: req.user.refreshToken (from JWT Guard)
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/kanban-board/api/v1.0.0/auth/refresh`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    }
                );

                const { accessToken } = response.data;

                // Save new access token
                localStorage.setItem('accessToken', accessToken);

                // Update auth-storage in localStorage (Zustand persist)
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    try {
                        const parsed = JSON.parse(authStorage);
                        parsed.state.accessToken = accessToken;
                        localStorage.setItem('auth-storage', JSON.stringify(parsed));
                    } catch {
                        // Ignore parse errors
                    }
                }

                // Process queued requests with new token
                processQueue(null, accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                processQueue(refreshError, null);
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
