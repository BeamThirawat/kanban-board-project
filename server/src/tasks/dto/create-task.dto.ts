import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsNumber,
    IsOptional,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsNotEmpty()
    columnId: string;

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
