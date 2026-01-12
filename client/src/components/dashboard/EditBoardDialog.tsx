import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { boardsApi, type Board } from '@/api/boards.api';

const editBoardSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters')
});

type EditBoardFormData = z.infer<typeof editBoardSchema>;

interface EditBoardDialogProps {
    board: Board;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditBoardDialog({ board, open, onOpenChange }: EditBoardDialogProps) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const form = useForm<EditBoardFormData>({
        resolver: zodResolver(editBoardSchema),
        defaultValues: {
            title: board.title
        },
    });

    // Reset form when board changes
    useEffect(() => {
        if (open) {
            form.reset({ title: board.title });
        }
    }, [board, open, form]);

    const updateMutation = useMutation({
        mutationFn: (data: EditBoardFormData) => boardsApi.updateBoard(board.id, data),
        onSuccess: () => {
            toast.success(t('dashboard.board.updated', 'Board updated successfully!'));
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            onOpenChange(false);
        },
        onError: (error: unknown) => {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message || t('dashboard.board.updateError', 'Failed to update board');
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: EditBoardFormData) => {
        updateMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {t('dashboard.editBoard', 'Edit Board')}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {t('dashboard.editBoardDescription', 'Update the board title.')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-200">
                                        {t('form.boardTitle', 'Board Title')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('form.boardTitlePlaceholder', 'Enter board title...')}
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-slate-300 hover:cursor-pointer dark:border-slate-600"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="bg-blue-600 hover:cursor-pointer hover:bg-blue-700 text-white"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('common.saving', 'Saving...')}
                                    </>
                                ) : (
                                    t('common.save', 'Save')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
