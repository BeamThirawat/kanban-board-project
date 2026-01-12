import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (accessToken: string, refreshToken: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

interface JwtPayload {
    sub: string;
    email: string;
    username: string;
    exp: number;
    iat: number;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            ...initialState,

            login: (accessToken: string, refreshToken: string, user: User) => {
                // Store tokens in localStorage for axios interceptor access
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Optionally decode token to get user info if not provided
                try {
                    const decoded = jwtDecode<JwtPayload>(accessToken);
                } catch (error) {
                    console.error('Failed to decode token:', error);
                }

                set({
                    accessToken,
                    refreshToken,
                    user,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                // Clear tokens from localStorage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                set({
                    ...initialState,
                });
            },

            setUser: (user: User) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
