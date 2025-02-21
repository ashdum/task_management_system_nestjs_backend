// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RedisUtil } from '../../common/utils/redis.util';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisUtil: RedisUtil,
  ) {}

  // Register a new user
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, fullName, avatar } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      avatar,
    });
    return this.userRepository.save(user);
  }

  // Login user and return JWT tokens
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    const accessTtl = this.getTtlInSeconds(process.env.JWT_ACCESS_EXPIRES_IN || '15m');
    const refreshTtl = this.getTtlInSeconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    await this.redisUtil.setToken(`access_token:${user.id}`, accessToken, accessTtl);
    await this.redisUtil.setToken(`refresh_token:${user.id}`, refreshToken, refreshTtl);

    return { accessToken, refreshToken };
  }

  // Refresh JWT tokens using validated user
  async refreshTokens(user: { sub: string; email: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.sub, email: user.email };
    const newAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    const accessTtl = this.getTtlInSeconds(process.env.JWT_ACCESS_EXPIRES_IN || '15m');
    const refreshTtl = this.getTtlInSeconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    await this.redisUtil.setToken(`access_token:${user.sub}`, newAccessToken, accessTtl);
    await this.redisUtil.setToken(`refresh_token:${user.sub}`, newRefreshToken, refreshTtl);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // Logout user by removing tokens from Redis
  async logout(userId: string): Promise<void> {
    await Promise.all([
      this.redisUtil.deleteToken(`access_token:${userId}`),
      this.redisUtil.deleteToken(`refresh_token:${userId}`),
    ]);
  }

  // Validate user for JwtStrategy and JwtRefreshStrategy
  async validateUser(userId: string): Promise<{ sub: string; email: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const tokenExists = await this.redisUtil.tokenExists(`access_token:${userId}`);
    if (!tokenExists) {
      throw new UnauthorizedException('Токен недействителен или истек');
    }

    return { sub: user.id, email: user.email };
  }

  // Helper method to convert expiresIn to seconds
  private getTtlInSeconds(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return value;
    }
  }
}