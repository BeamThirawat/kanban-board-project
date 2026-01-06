import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('columns')
export class BoardColumn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    order: number;

    @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @Column({ name: 'board_id' })
    boardId: string;

    @OneToMany(() => Task, (task) => task.column, { cascade: true })
    tasks: Task[];
}
