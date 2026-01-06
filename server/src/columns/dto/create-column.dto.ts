import { IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional } from 'class-validator';

export class CreateColumnDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    boardId: string;

    @IsNumber()
    @IsOptional()
    order?: number;
}
