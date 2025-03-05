import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RedisUtil } from '../../common/utils/redis.util';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
}));

// Mock RedisUtil
jest.mock('../../common/utils/redis.util', () => ({
    RedisUtil: jest.fn().mockImplementation(() => ({
        setToken: jest.fn().mockResolvedValue(undefined),
    })),
}));

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: Repository<User>;
    let jwtService: JwtService;
    let redisUtil: RedisUtil;

    const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        fullName: 'Test User',
        createdAt: new Date('2023-01-01T00:00:00Z'), 
        updatedAt: new Date('2023-01-01T00:00:00Z'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockReturnValue(mockUser),
                        save: jest.fn().mockResolvedValue(mockUser),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-token'),
                    },
                },
                RedisUtil, 
                {
                    provide: UsersService,
                    useValue: {
                        findOneWithPassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);
        redisUtil = module.get<RedisUtil>(RedisUtil);
    });

    it('should register a new user', async () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'Password123!',
            fullName: 'Test User',
        };

        const result = await service.register(registerDto);

        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
        expect(userRepository.create).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'hashed-password',
            fullName: 'Test User',
        });
        expect(userRepository.save).toHaveBeenCalledWith(mockUser);
        expect(jwtService.sign).toHaveBeenCalledTimes(2);
        expect(redisUtil.setToken).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
            accessToken: 'mock-token',
            refreshToken: 'mock-token',
            user: mockUser,
        });
    });
});