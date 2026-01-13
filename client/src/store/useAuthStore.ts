import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            ...initialState,

            login: (user: User) => {
                // Tokens are now stored in HttpOnly cookies by the server
                // We only need to store user info and auth state
                set({
                    user,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                // Cookies are cleared by the server on logout
                // Just clear local state
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
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
