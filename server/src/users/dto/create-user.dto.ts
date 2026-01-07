import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Unique username for the account',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        example: 'john@example.com',
        description: 'Unique email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}
