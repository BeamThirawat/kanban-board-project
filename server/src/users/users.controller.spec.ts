import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  // Mock user data
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    last_login: null,
    refresh_token: null,
    created_at: new Date(),
    updated_at: new Date(),
    boards: [],
  };

  const mockCreateUserDto: CreateUserDto = {
    username: 'newuser',
    email: 'new@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockCreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email exists', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if username exists', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Username already exists'),
      );

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('User with ID "non-existent-id" not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'updateduser',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, username: 'updateduser' };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user email', async () => {
      const updateDto: UpdateUserDto = { email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, email: 'newemail@example.com' };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result.email).toBe('newemail@example.com');
    });

    it('should update user password', async () => {
      const updateDto: UpdateUserDto = { password: 'newpassword123' };
      service.update.mockResolvedValue(mockUser);

      await controller.update(mockUser.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('User with ID "non-existent-id" not found'),
      );

      await expect(
        controller.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email already exists', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(
        controller.update(mockUser.id, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('User with ID "non-existent-id" not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
