import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) { }

  // เพิ่มผู้ใช้งาน
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info(`Creating user: ${createUserDto.email}`, { context: 'UsersService' });

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn(`User creation failed - email already exists: ${createUserDto.email}`, { context: 'UsersService' });
      throw new ConflictException('Email already exists');
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      this.logger.warn(`User creation failed - username already exists: ${createUserDto.username}`, { context: 'UsersService' });
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

    const savedUser = await this.usersRepository.save(user);
    this.logger.info(`User created successfully: ${savedUser.email} (ID: ${savedUser.id})`, { context: 'UsersService' });
    return savedUser;
  }

  // ค้นหาผู้ใช้งานทั้งหมด
  async findAll(): Promise<User[]> {
    this.logger.info('Finding all users', { context: 'UsersService' });
    const users = await this.usersRepository.find();
    this.logger.info(`Found ${users.length} users`, { context: 'UsersService' });
    return users;
  }

  // ค้นหาผู้ใช้งานโดยใช้ ID
  async findOne(id: string): Promise<User> {
    this.logger.info(`Finding user: ${id}`, { context: 'UsersService' });
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      this.logger.warn(`User not found: ${id}`, { context: 'UsersService' });
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    this.logger.info(`User found: ${id}`, { context: 'UsersService' });
    return user;
  }

  // ค้นหาผู้ใช้งานโดยใช้ email
  async findByEmail(email: string): Promise<User | null> {
    this.logger.info(`Finding user by email: ${email}`, { context: 'UsersService' });
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  // ค้นหาผู้ใช้งานโดยใช้ email ดึง password_hash มาด้วย
  async findByPasswordWithEmail(email: string): Promise<User | null> {
    this.logger.info(`Finding user by email with password: ${email}`, { context: 'UsersService' });
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  // อัปเดตข้อมูลผู้ใช้งานโดยใช้ ID
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.info(`Updating user: ${id}`, { context: 'UsersService' });
    const user = await this.findOne(id);

    // อัปเดต password
    if (updateUserDto.password) {
      this.logger.info(`Updating password for user: ${id}`, { context: 'UsersService' });
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
        this.logger.warn(`User update failed - email already exists: ${updateUserDto.email}`, { context: 'UsersService' });
        throw new ConflictException('Email already exists');
      }

      user.email = updateUserDto.email;
    }

    const updatedUser = await this.usersRepository.save(user);
    this.logger.info(`User updated successfully: ${id}`, { context: 'UsersService' });
    return updatedUser;
  }

  // ลบผู้ใช้งานโดยใช้ ID
  async remove(id: string): Promise<void> {
    this.logger.info(`Removing user: ${id}`, { context: 'UsersService' });
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    this.logger.info(`User removed successfully: ${id}`, { context: 'UsersService' });
  }

  // อัปเดต refresh token
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    this.logger.info(`Updating refresh token for user: ${id}`, { context: 'UsersService' });
    await this.usersRepository.update(id, { refresh_token: refreshToken });
  }

  // อัปเดต last login
  async updateLastLogin(id: string): Promise<void> {
    this.logger.info(`Updating last login for user: ${id}`, { context: 'UsersService' });
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  // ค้นหาผู้ใช้งานโดยใช้ ID ดึง refresh_token มาด้วย
  async findOneWithRefreshToken(id: string): Promise<User | null> {
    this.logger.info(`Finding user with refresh token: ${id}`, { context: 'UsersService' });
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refresh_token')
      .where('user.id = :id', { id })
      .getOne();
  }
}
