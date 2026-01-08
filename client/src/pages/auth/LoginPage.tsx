import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);

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
            const response = await api.post<LoginResponse>(
                '/kanban-board/api/v1/auth/login',
                data
            );

            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);

            toast.success('Welcome back!', {
                description: `Logged in as ${user.email}`,
            });

            navigate(from, { replace: true });
        } catch (error: unknown) {
            console.error('Login error:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message || 'Invalid email or password';
            toast.error('Login failed', {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

            <Card className="w-full max-w-md relative backdrop-blur-sm bg-slate-900/80 border-slate-700/50 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your credentials to access your boards
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
                                        <FormLabel className="text-slate-200">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                        <FormLabel className="text-slate-200">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-slate-400 text-center">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Create account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
