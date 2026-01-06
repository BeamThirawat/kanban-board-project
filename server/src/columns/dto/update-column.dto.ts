import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateColumnDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    order?: number;
}
