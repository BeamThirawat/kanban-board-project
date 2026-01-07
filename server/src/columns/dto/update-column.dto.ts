import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColumnDto {
    @ApiPropertyOptional({
        example: 'In Review',
        description: 'New name for the column',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        example: 250,
        description: 'New order position for the column',
    })
    @IsNumber()
    @IsOptional()
    order?: number;
}
