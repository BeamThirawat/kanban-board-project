import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardColumn } from '../columns/entities/column.entity';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(Board)
        private readonly boardsRepository: Repository<Board>,

        @InjectRepository(BoardColumn)
        private readonly columnsRepository: Repository<BoardColumn>,

        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    // สร้าง Board ใหม่
    async create(userId: string, createBoardDto: CreateBoardDto): Promise<Board> {
        this.logger.info(`Creating board: ${createBoardDto.title} for user: ${userId}`, { context: 'BoardsService' });

        const board = this.boardsRepository.create({
            ...createBoardDto,
            userId,
        });
        const savedBoard = await this.boardsRepository.save(board);

        // กำหนดค่ามาตรฐานที่อยากได้
        const defaultColumns = [
            { name: 'To Do', order: 100 },
            { name: 'Doing', order: 200 },
            { name: 'Done', order: 300 },
        ];

        for (const colDef of defaultColumns) {
            const column = this.columnsRepository.create({
                ...colDef,
                boardId: savedBoard.id,
            });
            await this.columnsRepository.save(column);
        }

        this.logger.info(`Board created successfully: ${savedBoard.id}`, { context: 'BoardsService' });
        return savedBoard;
    }

    // ค้นหา Board ทั้งหมดของ User
    async findAllByUser(userId: string): Promise<Board[]> {
        this.logger.info(`Finding all boards for user: ${userId}`, { context: 'BoardsService' });
        const boards = await this.boardsRepository.find({
            where: { userId },
            relations: ['columns'],
            order: { createdAt: 'DESC' },
        });
        this.logger.info(`Found ${boards.length} boards for user: ${userId}`, { context: 'BoardsService' });
        return boards;
    }

    // ค้นหา Board โดย ID
    async findOne(id: string, userId: string): Promise<Board> {
        this.logger.info(`Finding board: ${id} for user: ${userId}`, { context: 'BoardsService' });
        const board = await this.boardsRepository.findOne({
            where: { id, userId },
            relations: ['columns', 'columns.tasks'],
        });

        if (!board) {
            this.logger.warn(`Board not found: ${id}`, { context: 'BoardsService' });
            throw new NotFoundException(`Board with ID "${id}" not found`);
        }

        this.logger.info(`Board found: ${id}`, { context: 'BoardsService' });
        return board;
    }

    // อัปเดต Board
    async update(id: string, userId: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
        this.logger.info(`Updating board: ${id}`, { context: 'BoardsService' });
        const board = await this.findOne(id, userId);
        Object.assign(board, updateBoardDto);
        const updatedBoard = await this.boardsRepository.save(board);
        this.logger.info(`Board updated successfully: ${id}`, { context: 'BoardsService' });
        return updatedBoard;
    }

    // ลบ Board
    async remove(id: string, userId: string): Promise<void> {
        this.logger.info(`Removing board: ${id}`, { context: 'BoardsService' });
        const board = await this.findOne(id, userId);
        await this.boardsRepository.remove(board);
        this.logger.info(`Board removed successfully: ${id}`, { context: 'BoardsService' });
    }
}
