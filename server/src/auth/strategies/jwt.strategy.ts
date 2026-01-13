import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export type JwtPayload = {
    sub: string;
    email: string;
};

// Extract JWT from cookie or Authorization header
const extractJwtFromCookieOrHeader = (req: Request): string | null => {
    // First try to get from cookie
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    // Fallback to Authorization header (for Swagger and API clients)
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '').trim();
    }
    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: extractJwtFromCookieOrHeader,
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email };
    }
}
