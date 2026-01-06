import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Board } from '../../boards/entities/board.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    @Exclude()
    password_hash: string;

    @Column({ type: 'timestamp', nullable: true })
    last_login: Date | null;

    @Column({ type: 'text', nullable: true, select: false })
    @Exclude()
    refresh_token: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Board, (board) => board.user)
    boards: Board[];
}

