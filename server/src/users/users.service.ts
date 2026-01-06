import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  // เพิ่มผู้ใช้งาน
  async create(createUserDto: CreateUserDto): Promise<User> {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);

    // เพิ่มผู้ใช้งานลงใน DB
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password_hash,
    });

    return this.usersRepository.save(user);
  }

  // ค้นหาผู้ใช้งานทั้งหมด
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // ค้นหาผู้ใช้งานโดยใช้ ID
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  // ค้นหาผู้ใช้งานโดยใช้ email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  // ค้นหาผู้ใช้งานโดยใช้ email
  async findByPasswordWithEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  // อัปเดตข้อมูลผู้ใช้งานโดยใช้ ID
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // อัปเดต password
    if (updateUserDto.password) {
      const saltRounds = 10;
      user.password_hash = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // อัปเดต username
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.email) {
      // ตรวจสอบว่า email ซ้ำหรือไม่
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }

      user.email = updateUserDto.email;
    }

    return this.usersRepository.save(user);
  }

  // ลบผู้ใช้งานโดยใช้ ID
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  // อัปเดต refresh token
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, { refresh_token: refreshToken });
  }

  // อัปเดต last login
  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  // ค้นหาผู้ใช้งานโดยใช้ ID
  async findOneWithRefreshToken(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refresh_token')
      .where('user.id = :id', { id })
      .getOne();
  }
}
