import { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie configuration for JWT tokens
export const cookieConfig = {
    accessToken: {
        name: 'accessToken',
        options: {
            httpOnly: true,
            secure: isProduction, // HTTPS only in production
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 minutes
        } as CookieOptions,
    },
    refreshToken: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        } as CookieOptions,
    },
};

// Clear cookie options (for logout)
export const clearCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
};
