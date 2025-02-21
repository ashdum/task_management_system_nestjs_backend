// src/modules/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';

// Интерфейс для payload токена, соответствующий фронтенду
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
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден или токен недействителен');
    }

    const tokenExists = await this.redisUtil.tokenExists(`refresh_token:${payload.sub}`);
    if (!tokenExists) {
      throw new UnauthorizedException('Refresh-токен недействителен или истек');
    }

    return {
      sub: user.sub,
      email: user.email,
    };
  }
}