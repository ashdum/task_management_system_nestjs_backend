// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';

// Интерфейс для payload токена, соответствующий фронтенду
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
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'default_secret_key',
    });
  }

  // Validate JWT payload
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден или токен недействителен');
    }

    const storedToken = await this.redisUtil.getToken(`access_token:${payload.sub}`);
    if (!storedToken) {
      throw new UnauthorizedException('Токен не найден в Redis');
    }

    // Return user data matching frontend expectation
    return {
      sub: user.sub,
      email: user.email,
    };
  }
}