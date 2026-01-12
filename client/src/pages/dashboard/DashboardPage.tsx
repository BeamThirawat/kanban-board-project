import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { boardsApi } from '@/api/boards.api';
import { BoardCard } from '@/components/dashboard/BoardCard';
import { CreateBoardDialog } from '@/components/dashboard/CreateBoardDialog';

function BoardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
            ))}
        </div>
    );
}

function EmptyState() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {t('dashboard.noBoards', 'No boards yet')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                {t('dashboard.noBoardsDescription', 'Create your first board to start organizing your tasks and projects.')}
            </p>
            <CreateBoardDialog />
        </div>
    );
}

export function DashboardPage() {
    const { t } = useTranslation();

    const {
        data: boards,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['boards'],
        queryFn: async () => {
            const response = await boardsApi.fetchBoards();
            return response.data;
        },
    });

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <BoardsSkeleton />
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <RefreshCw className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {t('dashboard.error', 'Something went wrong')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                    {(error as Error)?.message || t('dashboard.errorDescription', 'Failed to load boards. Please try again.')}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('common.retry', 'Try Again')}
                </Button>
            </div>
        );
    }

    // Empty State
    if (!boards || boards.length === 0) {
        return <EmptyState />;
    }

    // Success State
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('dashboard.title', 'My Boards')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('dashboard.subtitle', '{{count}} boards', { count: boards.length })}
                    </p>
                </div>
                <CreateBoardDialog />
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                ))}
            </div>
        </div>
    );
}
