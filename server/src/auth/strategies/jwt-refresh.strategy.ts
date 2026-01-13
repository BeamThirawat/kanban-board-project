import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Extract JWT from cookie or Authorization header
const extractRefreshTokenFromCookieOrHeader = (req: Request): string | null => {
    // First try to get from cookie
    if (req.cookies && req.cookies.refreshToken) {
        return req.cookies.refreshToken;
    }
    // Fallback to Authorization header (for API clients)
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '').trim();
    }
    return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: extractRefreshTokenFromCookieOrHeader,
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        } as any);
    }

    async validate(req: Request, payload: { sub: string; email: string }) {
        // Get refresh token from cookie or header
        const refreshToken = req.cookies?.refreshToken ||
            req.get('Authorization')?.replace('Bearer ', '').trim();
        return { userId: payload.sub, email: payload.email, refreshToken };
    }
}
