// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { User } from '../users/entities/user.entity';
import { RedisUtil } from '../../common/utils/redis.util';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
        signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
      }),
    }),
    UsersModule, // Импортируем UsersModule для доступа к UsersService
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, RedisUtil],
  exports: [AuthService, JwtStrategy, JwtRefreshStrategy, PassportModule],
})
export class AuthModule {}
