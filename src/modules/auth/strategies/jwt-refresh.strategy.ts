// src/modules/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';
import { Request } from 'express';

// Интерфейс для payload токена
interface JwtPayload {
  sub: string;
  email: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
    createdAt: string;
    updatedAt?: string;
  };
  iat: number;
  exp: number;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly redisUtil: RedisUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Извлекаем refreshToken из тела запроса
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      passReqToCallback: true, // Передаем объект req в validate
    });
  }

  // Validate JWT payload and check refreshToken
  async validate(req: Request, payload: JwtPayload): Promise<{ sub: string; email: string }> {
    // Извлекаем refreshToken из тела запроса
    const refreshToken: string = req.body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh-токен не предоставлен');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден или токен недействителен');
    }

    // Получаем текущий refreshToken из Redis
    const storedRefreshToken = await this.redisUtil.getToken(`refresh_token:${payload.sub}`);
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh-токен недействителен или устарел');
    }

    return {
      sub: user.sub,
      email: user.email,
    };
  }
}