import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) { }

    // สร้าง Task ใหม่
    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        // ถ้าไม่ได้ระบุ order ให้หาค่าสูงสุดของ column แล้ว +1
        if (createTaskDto.order === undefined) {
            const maxOrder = await this.tasksRepository
                .createQueryBuilder('task')
                .where('task.column_id = :columnId', { columnId: createTaskDto.columnId })
                .select('MAX(task.order)', 'max')
                .getRawOne();
            createTaskDto.order = (maxOrder?.max || 0) + 1;
        }

        const task = this.tasksRepository.create(createTaskDto);
        return this.tasksRepository.save(task);
    }

    // ค้นหา Task ทั้งหมดของ Column (เรียงตาม order)
    async findAllByColumn(columnId: string): Promise<Task[]> {
        return this.tasksRepository.find({
            where: { columnId },
            order: { order: 'ASC' },
        });
    }

    // ค้นหา Task โดย ID
    async findOne(id: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }

        return task;
    }

    // อัปเดต Task (รวมถึงการย้าย column)
    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(id);
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    // ลบ Task
    async remove(id: string): Promise<void> {
        const task = await this.findOne(id);
        await this.tasksRepository.remove(task);
    }
}
