import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    // เข้าสู่ระบบ
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        // ค้นหาผู้ใช้งานโดยใช้ email ดึงเอา password_hash มาด้วย
        const user = await this.usersService.findByPasswordWithEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // ตรวจสอบ รหัสผ่าน
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // สร้าง token
        const tokens = await this.generateTokens(user.id, user.email);

        // อัปเดต refresh token ใน database
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        // อัปเดต last login
        await this.usersService.updateLastLogin(user.id);

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
        // อัปเดต refresh token ใน database เป็น null
        await this.usersService.updateRefreshToken(userId, null);
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
