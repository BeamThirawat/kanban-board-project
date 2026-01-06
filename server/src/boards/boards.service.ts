import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    ) { }

    // สร้าง Board ใหม่
    async create(userId: string, createBoardDto: CreateBoardDto): Promise<Board> {
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

        return savedBoard;
    }

    // ค้นหา Board ทั้งหมดของ User
    async findAllByUser(userId: string): Promise<Board[]> {
        return this.boardsRepository.find({
            where: { userId },
            relations: ['columns'],
            order: { createdAt: 'DESC' },
        });
    }

    // ค้นหา Board โดย ID
    async findOne(id: string, userId: string): Promise<Board> {
        const board = await this.boardsRepository.findOne({
            where: { id, userId },
            relations: ['columns', 'columns.tasks'],
        });

        if (!board) {
            throw new NotFoundException(`Board with ID "${id}" not found`);
        }

        return board;
    }

    // อัปเดต Board
    async update(id: string, userId: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
        const board = await this.findOne(id, userId);
        Object.assign(board, updateBoardDto);
        return this.boardsRepository.save(board);
    }

    // ลบ Board
    async remove(id: string, userId: string): Promise<void> {
        const board = await this.findOne(id, userId);
        await this.boardsRepository.remove(board);
    }
}
