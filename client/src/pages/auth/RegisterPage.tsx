import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { authApi } from '@/api/auth.api';

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'validation.username.min')
        .max(20, 'validation.username.max'),
    email: z.string().email('validation.email.invalid'),
    password: z
        .string()
        .min(8, 'validation.password.min')
        .regex(/[A-Z]/, 'validation.password.uppercase')
        .regex(/[a-z]/, 'validation.password.lowercase')
        .regex(/[0-9]/, 'validation.password.number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await authApi.register(data);

            toast.success(t('auth.register.success'), {
                description: t('auth.register.successDescription'),
            });

            navigate('/login');
        } catch (error: unknown) {
            console.error('Registration error:', error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message || t('auth.register.errorDescription');
            toast.error(t('auth.register.error'), {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/50 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t('auth.register.title')}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    {t('auth.register.description')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-200">
                                        {t('form.username')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('form.username.placeholder')}
                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-200">
                                        {t('form.email')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={t('form.email.placeholder')}
                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-200">
                                        {t('form.password')}
                                    </FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder={t('form.password.createPlaceholder')}
                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('auth.register.submitting')}
                                </>
                            ) : (
                                t('auth.register.submit')
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    {t('auth.register.hasAccount')}{' '}
                    <Link
                        to="/login"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors"
                    >
                        {t('auth.register.signIn')}
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
