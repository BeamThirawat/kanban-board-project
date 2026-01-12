import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { boardsApi, type Board } from '@/api/boards.api';
import { EditBoardDialog } from './EditBoardDialog';

interface BoardCardProps {
    board: Board;
}

// Safe date formatting helper
function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';

    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return format(date, 'dd MMM yyyy');
        }
        return 'N/A';
    } catch {
        return 'N/A';
    }
}

export function BoardCard({ board }: BoardCardProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleClick = () => {
        navigate(`/board/${board.id}`);
    };

    const deleteMutation = useMutation({
        mutationFn: () => boardsApi.deleteBoard(board.id),
        onSuccess: () => {
            toast.success(t('dashboard.board.deleted', 'Board deleted successfully!'));
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            setDeleteDialogOpen(false);
        },
        onError: (error: unknown) => {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message || t('dashboard.board.deleteError', 'Failed to delete board');
            toast.error(errorMessage);
        },
    });

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate();
    };

    return (
        <>
            <Card
                onClick={handleClick}
                className="cursor-pointer group hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                        <span className="truncate">{board.title}</span>
                        <div className="flex items-center gap-1">
                            {/* Edit Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:cursor-pointer transition-opacity text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={handleEdit}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            {/* Delete Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:cursor-pointer transition-opacity text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                                onClick={handleDeleteClick}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(board.createdAt)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <EditBoardDialog
                board={board}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white">
                            {t('dashboard.board.deleteTitle', 'Delete Board')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            {t('dashboard.board.confirmDelete', 'Are you sure you want to delete this board? This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-300 hover:cursor-pointer dark:border-slate-600">
                            {t('common.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white"
                        >
                            {deleteMutation.isPending
                                ? t('common.deleting', 'Deleting...')
                                : t('common.delete', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
