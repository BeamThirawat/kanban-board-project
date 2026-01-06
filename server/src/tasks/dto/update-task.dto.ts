import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsUUID,
    IsDateString,
} from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    columnId?: string; // สำหรับการย้าย task ข้าม column

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}
