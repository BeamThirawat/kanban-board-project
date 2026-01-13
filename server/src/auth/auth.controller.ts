import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { cookieConfig, clearCookieOptions } from '../config/cookie.config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // สมัครสมาชิก
    @Post('register')
    @ApiOperation({ summary: 'User registration', description: 'Register a new user account' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Registration successful, sets cookies and returns user info' })
    @ApiResponse({ status: 409, description: 'Email or username already exists' })
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(registerDto);

        // Set HttpOnly cookies
        res.cookie(cookieConfig.accessToken.name, result.accessToken, cookieConfig.accessToken.options);
        res.cookie(cookieConfig.refreshToken.name, result.refreshToken, cookieConfig.refreshToken.options);

        // Return user info only (tokens are in cookies)
        return {
            message: 'Registration successful',
            user: result.user,
        };
    }

    // เข้าสู่ระบบ
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful, sets cookies and returns user info' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        // Set HttpOnly cookies
        res.cookie(cookieConfig.accessToken.name, result.accessToken, cookieConfig.accessToken.options);
        res.cookie(cookieConfig.refreshToken.name, result.refreshToken, cookieConfig.refreshToken.options);

        // Return user info only (tokens are in cookies)
        return {
            message: 'Login successful',
            user: result.user,
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'User logout', description: 'Logout user and invalidate refresh token' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.logout(req.user.userId);

        // Clear cookies
        res.clearCookie(cookieConfig.accessToken.name, clearCookieOptions);
        res.clearCookie(cookieConfig.refreshToken.name, clearCookieOptions);

        return result;
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Refresh tokens', description: 'Get new access and refresh tokens using refresh token' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
    async refreshTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refreshTokens(req.user.userId, req.user.refreshToken);

        // Set new cookies
        res.cookie(cookieConfig.accessToken.name, tokens.accessToken, cookieConfig.accessToken.options);
        res.cookie(cookieConfig.refreshToken.name, tokens.refreshToken, cookieConfig.refreshToken.options);

        return { message: 'Tokens refreshed successfully' };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user profile', description: 'Get current authenticated user profile' })
    @ApiResponse({ status: 200, description: 'Returns user profile information' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProfile(@Req() req: any) {
        return req.user;
    }
}
