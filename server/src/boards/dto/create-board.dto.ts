import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
    @ApiProperty({
        example: 'My Project Board',
        description: 'Title of the Kanban board',
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}
