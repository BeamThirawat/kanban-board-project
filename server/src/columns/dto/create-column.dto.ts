import { IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColumnDto {
    @ApiProperty({
        example: 'In Progress',
        description: 'Name of the column',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the board this column belongs to',
    })
    @IsUUID()
    @IsNotEmpty()
    boardId: string;

    @ApiPropertyOptional({
        example: 150,
        description: 'Order position of the column (optional, auto-calculated if not provided)',
    })
    @IsNumber()
    @IsOptional()
    order?: number;
}
