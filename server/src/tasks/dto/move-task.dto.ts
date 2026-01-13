import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveTaskDto {
    @ApiProperty({
        description: 'Target column UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    columnId: string;

    @ApiProperty({
        description: 'New order/position in the target column (0-indexed)',
        example: 0,
        minimum: 0,
    })
    @IsInt()
    @Min(0)
    order: number;
}
