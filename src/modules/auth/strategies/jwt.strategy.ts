// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';
import { Request as ExpressRequest } from 'express';
import config from 'config/config';

// Интерфейс для payload токена
interface JwtPayload {
  sub: string; // ID пользователя
  email: string; // Email пользователя
  user: {
    id: string;
    email: string;
    fullName?: string;
    createdAt: string;
    updatedAt?: string;
  };
  iat: number; // Issued at
  exp: number; // Expiration
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly redisUtil: RedisUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
      passReqToCallback: true, // Передаем объект req в validate
    });
  }

  // Validate JWT payload and check accessToken
  async validate(
    req: ExpressRequest,
    payload: JwtPayload,
  ): Promise<{ sub: string; email: string }> {
    // Извлекаем accessToken из заголовка Authorization
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new UnauthorizedException('Access-токен не предоставлен');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Пользователь не найден или токен недействителен',
      );
    }

    // Получаем текущий accessToken из Redis
    const storedAccessToken = await this.redisUtil.getToken(
      `access_token:${payload.sub}`,
    );
    if (!storedAccessToken || storedAccessToken !== accessToken) {
      throw new UnauthorizedException(
        'Access-токен недействителен или устарел',
      );
    }

    return {
      sub: user.sub,
      email: user.email,
    };
  }
}
