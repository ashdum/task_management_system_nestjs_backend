// src/modules/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';
import { Request as ExpressRequest } from 'express';
import config from 'config/config';

// Interface for token payload
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
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly redisUtil: RedisUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Extract refreshToken from request body
      ignoreExpiration: false,
      secretOrKey: config.jwt.refreshSecret,
      passReqToCallback: true, // Pass the request object to validate
    });
  }

  // Validate JWT payload and check refreshToken
  async validate(
    req: ExpressRequest,
    payload: JwtPayload,
  ): Promise<{ sub: string; email: string }> {
    // Extract refreshToken from request body
    const refreshToken: string = (req.body as { refreshToken: string })
      .refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'User not found or token is invalid',
      );
    }

    // Retrieve the current refreshToken from Redis
    const storedRefreshToken = await this.redisUtil.getToken(
      `refresh_token:${payload.sub}`,
    );
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is invalid or expired',
      );
    }

    return {
      sub: user.sub,
      email: user.email,
    };
  }
}