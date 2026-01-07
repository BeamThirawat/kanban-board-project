import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BoardColumn } from '../../columns/entities/column.entity';
import { TaskPriority } from '../enums/task-priority.enum';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    order: number;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date | null;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date | null;

    @ManyToOne(() => BoardColumn, (column) => column.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'column_id' })
    column: BoardColumn;

    @Column({ name: 'column_id' })
    columnId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
