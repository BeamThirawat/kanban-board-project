import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useAuthStore } from '@/store/useAuthStore';

const loginSchema = z.object({
    email: z.string().email('validation.email.invalid'),
    password: z.string().min(1, 'validation.password.required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const from = location.state?.from?.pathname || '/';

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(data);

            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);

            toast.success(t('auth.login.success'), {
                description: t('auth.login.successDescription', { email: user.email }),
            });

            navigate(from, { replace: true });
        } catch (error: unknown) {
            console.error('Login error:', error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message || t('auth.login.errorDescription');
            toast.error(t('auth.login.error'), {
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
                    {t('auth.login.title')}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    {t('auth.login.description')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                            placeholder={t('form.password.placeholder')}
                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('auth.login.submitting')}
                                </>
                            ) : (
                                t('auth.login.submit')
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    {t('auth.login.noAccount')}{' '}
                    <Link
                        to="/register"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        {t('auth.login.createAccount')}
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
