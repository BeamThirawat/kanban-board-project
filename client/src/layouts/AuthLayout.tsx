import { Outlet } from 'react-router-dom';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-900/20" />

            {/* Top-right controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <LanguageToggle />
                <ModeToggle />
            </div>

            {/* Centered content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <Outlet />
            </div>
        </div>
    );
}
