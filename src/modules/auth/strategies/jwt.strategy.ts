// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RedisUtil } from '../../../common/utils/redis.util';
import { Request as ExpressRequest } from 'express';
import config from 'config/config';

// Interface for token payload
interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
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
      passReqToCallback: true, // Pass the request object to validate
    });
  }

  // Validate JWT payload and check accessToken
  async validate(
    req: ExpressRequest,
    payload: JwtPayload,
  ): Promise<{ sub: string; email: string }> {
    // Extract accessToken from Authorization header
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'User not found or token is invalid',
      );
    }

    // Retrieve the current accessToken from Redis
    const storedAccessToken = await this.redisUtil.getToken(
      `access_token:${payload.sub}`,
    );
    if (!storedAccessToken || storedAccessToken !== accessToken) {
      throw new UnauthorizedException(
        'Access token is invalid or expired',
      );
    }

    return {
      sub: user.sub,
      email: user.email,
    };
  }
}