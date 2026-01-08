import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { BoardColumn } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
    constructor(
        @InjectRepository(BoardColumn)
        private readonly columnsRepository: Repository<BoardColumn>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    // สร้าง Column ใหม่
    async create(createColumnDto: CreateColumnDto): Promise<BoardColumn> {
        this.logger.info(`Creating column: ${createColumnDto.name} for board: ${createColumnDto.boardId}`, { context: 'ColumnsService' });

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
        const savedColumn = await this.columnsRepository.save(column);
        this.logger.info(`Column created successfully: ${savedColumn.id}`, { context: 'ColumnsService' });
        return savedColumn;
    }

    // ค้นหา Column ทั้งหมดของ Board (เรียงตาม order)
    async findAllByBoard(boardId: string): Promise<BoardColumn[]> {
        this.logger.info(`Finding all columns for board: ${boardId}`, { context: 'ColumnsService' });
        const columns = await this.columnsRepository.find({
            where: { boardId },
            relations: ['tasks'],
            order: { order: 'ASC' },
        });
        this.logger.info(`Found ${columns.length} columns for board: ${boardId}`, { context: 'ColumnsService' });
        return columns;
    }

    // ค้นหา Column โดย ID
    async findOne(id: string): Promise<BoardColumn> {
        this.logger.info(`Finding column: ${id}`, { context: 'ColumnsService' });
        const column = await this.columnsRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });

        if (!column) {
            this.logger.warn(`Column not found: ${id}`, { context: 'ColumnsService' });
            throw new NotFoundException(`Column with ID "${id}" not found`);
        }

        this.logger.info(`Column found: ${id}`, { context: 'ColumnsService' });
        return column;
    }

    // อัปเดต Column
    async update(id: string, updateColumnDto: UpdateColumnDto): Promise<BoardColumn> {
        this.logger.info(`Updating column: ${id}`, { context: 'ColumnsService' });
        const column = await this.findOne(id);
        Object.assign(column, updateColumnDto);
        const updatedColumn = await this.columnsRepository.save(column);
        this.logger.info(`Column updated successfully: ${id}`, { context: 'ColumnsService' });
        return updatedColumn;
    }

    // ลบ Column
    async remove(id: string): Promise<void> {
        this.logger.info(`Removing column: ${id}`, { context: 'ColumnsService' });
        const column = await this.findOne(id);
        await this.columnsRepository.remove(column);
        this.logger.info(`Column removed successfully: ${id}`, { context: 'ColumnsService' });
    }
}
