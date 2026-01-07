import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsNumber,
    IsOptional,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';

export class CreateTaskDto {
    @ApiProperty({
        example: 'Implement login feature',
        description: 'Title of the task',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({
        example: 'Create login form with email and password validation',
        description: 'Detailed description of the task',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the column this task belongs to',
    })
    @IsUUID()
    @IsNotEmpty()
    columnId: string;

    @ApiPropertyOptional({
        example: 'high',
        description: 'Task priority level',
        enum: TaskPriority,
    })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional({
        example: 100,
        description: 'Order position within the column',
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({
        example: '2026-01-10',
        description: 'Task start date (ISO date string)',
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2026-01-15',
        description: 'Task end/due date (ISO date string)',
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}
