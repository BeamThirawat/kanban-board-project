import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { boardsApi } from '@/api/boards.api';

const createBoardSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters')
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export function CreateBoardDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const form = useForm<CreateBoardFormData>({
        resolver: zodResolver(createBoardSchema),
        defaultValues: {
            title: ''
        },
    });

    const createMutation = useMutation({
        mutationFn: boardsApi.createBoard,
        onSuccess: () => {
            toast.success(t('dashboard.board.created', 'Board created successfully!'));
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            setOpen(false);
            form.reset();
        },
        onError: (error: unknown) => {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message || t('dashboard.board.createError', 'Failed to create board');
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: CreateBoardFormData) => {
        createMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.createBoard', 'Create New Board')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {t('dashboard.createBoard', 'Create New Board')}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {t('dashboard.createBoardDescription', 'Add a new board to organize your tasks.')}
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
                                onClick={() => setOpen(false)}
                                className="border-slate-300 hover:cursor-pointer dark:border-slate-600"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('common.creating', 'Creating...')}
                                    </>
                                ) : (
                                    t('common.create', 'Create')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
