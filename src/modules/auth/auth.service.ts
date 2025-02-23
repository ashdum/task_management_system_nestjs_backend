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
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisUtil: RedisUtil,
    private readonly usersService: UsersService, // Добавляем UsersService
  ) { }

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
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
    const savedUser = await this.userRepository.save(user);

    return this.generateTokens(savedUser);
  }

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

    return this.generateTokens(user);
  }

  async refreshTokens(user: { sub: string; email: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const foundUser = await this.userRepository.findOne({ where: { id: user.sub } });
    if (!foundUser) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.generateTokens(foundUser);
  }

  async logout(userId: string): Promise<void> {
    await Promise.all([
      this.redisUtil.deleteToken(`access_token:${userId}`),
      this.redisUtil.deleteToken(`refresh_token:${userId}`),
    ]);
  }

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

  // Change password and return new tokens
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOneWithPassword(userId);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный старый пароль');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    // Invalidate old tokens
    await this.logout(userId);

    // Generate and return new tokens
    return this.generateTokens(user);
  }

  // Helper method to generate tokens
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
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
    this.redisUtil.setToken(`access_token:${user.id}`, accessToken, accessTtl);
    this.redisUtil.setToken(`refresh_token:${user.id}`, refreshToken, refreshTtl);

    return { accessToken, refreshToken };
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

  // src/modules/auth/auth.service.ts (фрагмент)
  async loginWithGoogle(googleUser: { email: string; fullName: string; googleId: string }) {
    let user = await this.userRepository.findOne({ where: { email: googleUser.email } });
    if (!user) {
      user = this.userRepository.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        password: '', // Пароль не нужен для OAuth
      });
      await this.userRepository.save(user);
    }
    return this.generateTokens(user);
  }

  async loginWithGithub(githubUser: { email: string; fullName: string; githubId: string }) {
    let user = await this.userRepository.findOne({ where: { email: githubUser.email } });
    if (!user) {
      user = this.userRepository.create({
        email: githubUser.email,
        fullName: githubUser.fullName,
        password: '', // Пароль не нужен для OAuth
      });
      await this.userRepository.save(user);
    }
    return this.generateTokens(user);
  }
}