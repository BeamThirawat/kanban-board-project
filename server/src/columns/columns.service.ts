import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BoardColumn } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
    constructor(
        @InjectRepository(BoardColumn)
        private readonly columnsRepository: Repository<BoardColumn>,
    ) { }

    // สร้าง Column ใหม่
    async create(createColumnDto: CreateColumnDto): Promise<BoardColumn> {
        // ถ้าไม่ได้ระบุ order ให้หาค่าสูงสุดของ board แล้ว +1
        if (createColumnDto.order === undefined) {
            const maxOrder = await this.columnsRepository
                .createQueryBuilder('column')
                .where('column.board_id = :boardId', { boardId: createColumnDto.boardId })
                .select('MAX(column.order)', 'max')
                .getRawOne();
            createColumnDto.order = (maxOrder?.max || 0) + 1;
        }

        const column = this.columnsRepository.create(createColumnDto);
        return this.columnsRepository.save(column);
    }

    // ค้นหา Column ทั้งหมดของ Board (เรียงตาม order)
    async findAllByBoard(boardId: string): Promise<BoardColumn[]> {
        return this.columnsRepository.find({
            where: { boardId },
            relations: ['tasks'],
            order: { order: 'ASC' },
        });
    }

    // ค้นหา Column โดย ID
    async findOne(id: string): Promise<BoardColumn> {
        const column = await this.columnsRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });

        if (!column) {
            throw new NotFoundException(`Column with ID "${id}" not found`);
        }

        return column;
    }

    // อัปเดต Column
    async update(id: string, updateColumnDto: UpdateColumnDto): Promise<BoardColumn> {
        const column = await this.findOne(id);
        Object.assign(column, updateColumnDto);
        return this.columnsRepository.save(column);
    }

    // ลบ Column
    async remove(id: string): Promise<void> {
        const column = await this.findOne(id);
        await this.columnsRepository.remove(column);
    }
}
