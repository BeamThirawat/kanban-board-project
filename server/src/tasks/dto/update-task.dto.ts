import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsUUID,
    IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        example: 'Updated task title',
        description: 'New title for the task',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        example: 'Updated description with more details',
        description: 'New description for the task',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the target column (for moving task between columns)',
    })
    @IsUUID()
    @IsOptional()
    columnId?: string;

    @ApiPropertyOptional({
        example: 'high',
        description: 'New priority level',
        enum: TaskPriority,
    })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional({
        example: 150,
        description: 'New order position within the column',
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({
        example: '2026-01-12',
        description: 'New start date (ISO date string)',
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2026-01-20',
        description: 'New end/due date (ISO date string)',
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}
