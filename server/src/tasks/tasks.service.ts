import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    // สร้าง Task ใหม่
    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        this.logger.info(`Creating task: ${createTaskDto.title} for column: ${createTaskDto.columnId}`, { context: 'TasksService' });

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
        const savedTask = await this.tasksRepository.save(task);
        this.logger.info(`Task created successfully: ${savedTask.id}`, { context: 'TasksService' });
        return savedTask;
    }

    // ค้นหา Task ทั้งหมดของ Column (เรียงตาม order)
    async findAllByColumn(columnId: string): Promise<Task[]> {
        this.logger.info(`Finding all tasks for column: ${columnId}`, { context: 'TasksService' });
        const tasks = await this.tasksRepository.find({
            where: { columnId },
            order: { order: 'ASC' },
        });
        this.logger.info(`Found ${tasks.length} tasks for column: ${columnId}`, { context: 'TasksService' });
        return tasks;
    }

    // ค้นหา Task โดย ID
    async findOne(id: string): Promise<Task> {
        this.logger.info(`Finding task: ${id}`, { context: 'TasksService' });
        const task = await this.tasksRepository.findOne({
            where: { id },
        });

        if (!task) {
            this.logger.warn(`Task not found: ${id}`, { context: 'TasksService' });
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }

        this.logger.info(`Task found: ${id}`, { context: 'TasksService' });
        return task;
    }

    // อัปเดต Task (รวมถึงการย้าย column)
    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        this.logger.info(`Updating task: ${id}`, { context: 'TasksService' });
        const task = await this.findOne(id);

        // Log ถ้าย้าย column
        if (updateTaskDto.columnId && updateTaskDto.columnId !== task.columnId) {
            this.logger.info(`Moving task ${id} from column ${task.columnId} to ${updateTaskDto.columnId}`, { context: 'TasksService' });
        }

        Object.assign(task, updateTaskDto);
        const updatedTask = await this.tasksRepository.save(task);
        this.logger.info(`Task updated successfully: ${id}`, { context: 'TasksService' });
        return updatedTask;
    }

    // ย้าย Task ไปยัง Column ใหม่พร้อมเรียงลำดับ
    async moveTask(id: string, moveTaskDto: MoveTaskDto): Promise<Task> {
        const { columnId: targetColumnId, order: newOrder } = moveTaskDto;

        this.logger.info(`Moving task ${id} to column ${targetColumnId} at order ${newOrder}`, { context: 'TasksService' });

        const task = await this.findOne(id);
        const sourceColumnId = task.columnId;
        const oldOrder = task.order;
        const isSameColumn = sourceColumnId === targetColumnId;

        // ถ้าย้ายใน column เดิม
        if (isSameColumn) {
            if (oldOrder === newOrder) {
                // ไม่มีการเปลี่ยนแปลง
                return task;
            }

            // ปรับลำดับ task อื่นๆ ใน column เดียวกัน
            if (newOrder < oldOrder) {
                // ย้ายขึ้น: เลื่อน task ที่อยู่ระหว่าง newOrder ถึง oldOrder-1 ลง 1
                await this.tasksRepository
                    .createQueryBuilder()
                    .update(Task)
                    .set({ order: () => '"order" + 1' })
                    .where('column_id = :columnId', { columnId: targetColumnId })
                    .andWhere('"order" >= :newOrder', { newOrder })
                    .andWhere('"order" < :oldOrder', { oldOrder })
                    .andWhere('id != :taskId', { taskId: id })
                    .execute();
            } else {
                // ย้ายลง: เลื่อน task ที่อยู่ระหว่าง oldOrder+1 ถึง newOrder ขึ้น 1
                await this.tasksRepository
                    .createQueryBuilder()
                    .update(Task)
                    .set({ order: () => '"order" - 1' })
                    .where('column_id = :columnId', { columnId: targetColumnId })
                    .andWhere('"order" > :oldOrder', { oldOrder })
                    .andWhere('"order" <= :newOrder', { newOrder })
                    .andWhere('id != :taskId', { taskId: id })
                    .execute();
            }
        } else {
            // ย้ายข้าม column

            // 1. ลดลำดับ task ที่อยู่หลัง task ที่ย้ายออกใน source column
            await this.tasksRepository
                .createQueryBuilder()
                .update(Task)
                .set({ order: () => '"order" - 1' })
                .where('column_id = :columnId', { columnId: sourceColumnId })
                .andWhere('"order" > :oldOrder', { oldOrder })
                .execute();

            // 2. เพิ่มลำดับ task ที่อยู่ตั้งแต่ newOrder ใน target column
            await this.tasksRepository
                .createQueryBuilder()
                .update(Task)
                .set({ order: () => '"order" + 1' })
                .where('column_id = :columnId', { columnId: targetColumnId })
                .andWhere('"order" >= :newOrder', { newOrder })
                .execute();
        }

        // อัปเดต task ที่ย้าย
        task.columnId = targetColumnId;
        task.order = newOrder;
        const movedTask = await this.tasksRepository.save(task);

        this.logger.info(`Task ${id} moved successfully to column ${targetColumnId} at order ${newOrder}`, { context: 'TasksService' });
        return movedTask;
    }

    // ลบ Task
    async remove(id: string): Promise<void> {
        this.logger.info(`Removing task: ${id}`, { context: 'TasksService' });
        const task = await this.findOne(id);

        // ลดลำดับ task ที่อยู่หลัง task ที่ลบ
        await this.tasksRepository
            .createQueryBuilder()
            .update(Task)
            .set({ order: () => '"order" - 1' })
            .where('column_id = :columnId', { columnId: task.columnId })
            .andWhere('"order" > :order', { order: task.order })
            .execute();

        await this.tasksRepository.remove(task);
        this.logger.info(`Task removed successfully: ${id}`, { context: 'TasksService' });
    }
}
