import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/auth.api';

export function DashboardLayout() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        try {
            // Call backend logout API to invalidate refresh token
            await authApi.logout();
        } catch (error) {
            // Continue logout even if API fails
            console.error('Logout API error:', error);
        } finally {
            // Clear local state and redirect
            logout();
            toast.success(t('auth.logout.success', 'Logged out successfully'));
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">KB</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Kanban Board
                        </span>
                    </div>

                    {/* Right: User info & Controls */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                                {user.username}
                            </span>
                        )}
                        <LanguageToggle />
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-slate-600 dark:text-slate-400 hover:cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                            title={t('auth.logout', 'Logout')}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
