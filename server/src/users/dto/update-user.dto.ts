import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({
        example: 'newpassword123',
        description: 'New password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password?: string;
}
