import {
    Injectable,
    Inject,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    // สมัครสมาชิก
    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        this.logger.info(`Registering new user: ${registerDto.email}`, { context: 'AuthService' });

        // ตรวจสอบว่า email ซ้ำหรือไม่
        const existingEmail = await this.usersService.findByEmail(registerDto.email);
        if (existingEmail) {
            this.logger.warn(`Registration failed - email already exists: ${registerDto.email}`, { context: 'AuthService' });
            throw new ConflictException('Email already exists');
        }

        // สร้าง user ใหม่
        const user = await this.usersService.create({
            username: registerDto.username,
            email: registerDto.email,
            password: registerDto.password,
        });

        // สร้าง tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // อัปเดต refresh token ใน database
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        this.logger.info(`User registered successfully: ${user.email} (ID: ${user.id})`, { context: 'AuthService' });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }

    // เข้าสู่ระบบ
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        this.logger.info(`Login attempt: ${loginDto.email}`, { context: 'AuthService' });

        // ค้นหาผู้ใช้งานโดยใช้ email ดึงเอา password_hash มาด้วย
        const user = await this.usersService.findByPasswordWithEmail(loginDto.email);

        if (!user) {
            this.logger.warn(`Login failed - user not found: ${loginDto.email}`, { context: 'AuthService' });
            throw new UnauthorizedException('Invalid credentials');
        }

        // ตรวจสอบ รหัสผ่าน
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed - invalid password: ${loginDto.email}`, { context: 'AuthService' });
            throw new UnauthorizedException('Invalid credentials');
        }

        // สร้าง token
        const tokens = await this.generateTokens(user.id, user.email);

        // อัปเดต refresh token ใน database
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        // อัปเดต last login
        await this.usersService.updateLastLogin(user.id);

        this.logger.info(`User logged in: ${user.email} (ID: ${user.id})`, { context: 'AuthService' });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }

    // ออกจากระบบ
    async logout(userId: string): Promise<{ message: string }> {
        this.logger.info(`User logout: ${userId}`, { context: 'AuthService' });
        // อัปเดต refresh token ใน database เป็น null
        await this.usersService.updateRefreshToken(userId, null);
        this.logger.info(`User logged out successfully: ${userId}`, { context: 'AuthService' });
        return { message: 'Logged out successfully' };
    }

    // รีเฟรช token
    async refreshTokens(
        userId: string,
        refreshToken: string,
    ): Promise<Omit<AuthResponseDto, 'user'>> {
        // ค้นหาผู้ใช้งานโดยใช้ ID ดึงเอา refresh_token มาด้วย
        const user = await this.usersService.findOneWithRefreshToken(userId);

        if (!user || !user.refresh_token) {
            throw new ForbiddenException('Access denied');
        }

        // ตรวจสอบ refresh token
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refresh_token);

        if (!isRefreshTokenValid) {
            throw new ForbiddenException('Access denied');
        }

        // สร้าง token
        const tokens = await this.generateTokens(user.id, user.email);

        // อัปเดต refresh token ใน database
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return tokens;
    }

    private async generateTokens(
        userId: string,
        email: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email };

        const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
        const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: accessExpiresIn as any,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: refreshExpiresIn as any,
        });

        return { accessToken, refreshToken };
    }
}
