import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

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

  // Mock QueryBuilder
  const mockQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  } as unknown as jest.Mocked<SelectQueryBuilder<User>>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      repository.findOne.mockResolvedValue(null); // No existing user
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.create(mockCreateUserDto);

      expect(repository.findOne).toHaveBeenCalledTimes(2); // Check email and username
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password_hash: 'hashed_password',
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findOne.mockResolvedValue(mockUser); // Email exists - use mockResolvedValue for multiple assertions

      const promise = service.create(mockCreateUserDto);

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow('Email already exists');
    });

    it('should throw ConflictException if username already exists', async () => {
      repository.findOne
        .mockResolvedValueOnce(null) // Email not exists
        .mockResolvedValueOnce(mockUser); // Username exists

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const promise = service.findOne('non-existent-id');

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('User with ID "non-existent-id" not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByPasswordWithEmail', () => {
    it('should return user with password_hash selected', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByPasswordWithEmail('test@example.com');

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password_hash');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByPasswordWithEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'updateduser',
      email: 'updated@example.com',
      password: 'newpassword123',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      const result = await service.update(mockUser.id, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should update only username if provided', async () => {
      repository.findOne.mockResolvedValue({ ...mockUser });
      repository.save.mockImplementation((user) => Promise.resolve(user as User));

      await service.update(mockUser.id, { username: 'newname' });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newname' }),
      );
    });

    it('should update only email if provided and not duplicate', async () => {
      repository.findOne
        .mockResolvedValueOnce({ ...mockUser }) // findOne by id
        .mockResolvedValueOnce(null); // check email duplicate
      repository.save.mockImplementation((user) => Promise.resolve(user as User));

      await service.update(mockUser.id, { email: 'newemail@example.com' });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newemail@example.com' }),
      );
    });

    it('should throw ConflictException if new email already exists for another user', async () => {
      const anotherUser = { ...mockUser, id: 'another-id' };
      repository.findOne
        .mockResolvedValueOnce(mockUser) // findOne by id
        .mockResolvedValueOnce(anotherUser); // check email duplicate - found another user

      await expect(
        service.update(mockUser.id, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow update email to same email (same user)', async () => {
      repository.findOne
        .mockResolvedValueOnce({ ...mockUser }) // findOne by id
        .mockResolvedValueOnce(mockUser); // check email duplicate - found same user
      repository.save.mockImplementation((user) => Promise.resolve(user as User));

      await expect(
        service.update(mockUser.id, { email: mockUser.email }),
      ).resolves.toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token successfully', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateRefreshToken(mockUser.id, 'new_refresh_token');

      expect(repository.update).toHaveBeenCalledWith(mockUser.id, {
        refresh_token: 'new_refresh_token',
      });
    });

    it('should set refresh token to null (logout)', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateRefreshToken(mockUser.id, null);

      expect(repository.update).toHaveBeenCalledWith(mockUser.id, {
        refresh_token: null,
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      const beforeCall = new Date();

      await service.updateLastLogin(mockUser.id);

      expect(repository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          last_login: expect.any(Date),
        }),
      );

      // Verify the date is recent
      const callArg = repository.update.mock.calls[0][1] as { last_login: Date };
      expect(callArg.last_login.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    });
  });

  describe('findOneWithRefreshToken', () => {
    it('should return user with refresh_token selected', async () => {
      const userWithToken = { ...mockUser, refresh_token: 'some_token' };
      mockQueryBuilder.getOne.mockResolvedValue(userWithToken);

      const result = await service.findOneWithRefreshToken(mockUser.id);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.refresh_token');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', {
        id: mockUser.id,
      });
      expect(result).toEqual(userWithToken);
    });

    it('should return null if user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findOneWithRefreshToken('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
