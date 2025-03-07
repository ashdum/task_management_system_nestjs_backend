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
import { OAuth2Client } from 'google-auth-library';
import config from 'config/config';

// Interfaces for typing data from GitHub
interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisUtil: RedisUtil,
    private readonly usersService: UsersService,
  ) {
    this.googleClient = new OAuth2Client(config.oauth.google.clientId);
    this.githubClientId = config.oauth.github.clientId;
    this.githubClientSecret = config.oauth.github.clientSecret;
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { email, password, fullName, avatar } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException(
        "User with this email already exists",
      );
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

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(user: {
    sub: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const foundUser = await this.userRepository.findOne({
      where: { id: user.sub },
    });
    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(foundUser);
  }

  async logout(userId: string): Promise<void> {
    await Promise.all([
      this.redisUtil.deleteToken(`access_token:${userId}`),
      this.redisUtil.deleteToken(`refresh_token:${userId}`),
    ]);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.usersService.findOneWithPassword(userId);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    await this.logout(userId);

    return this.generateTokens(user);
  }

  async googleLogin(
    credential: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: config.oauth.google.clientId, 
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
      throw new UnauthorizedException('Invalid Google token');

    return this.loginWithOAuth({
      email: payload.email,
      fullName: payload.name || payload.email.split('@')[0],
      oauthId: payload.sub,
      provider: 'google',
      avatar: payload.picture || '',
    });
  }

  async githubCall(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    try {
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: this.githubClientId,
            client_secret: this.githubClientSecret,
            code,
          }),
        },
      );
      const tokenData: GitHubTokenResponse = await tokenResponse.json();

      if (!tokenData.access_token)
        throw new UnauthorizedException('Failed to obtain GitHub token');

      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenData.access_token}` },
      });
      const userData: GitHubUserResponse = await userResponse.json();

      if (!userData.id) {
        throw new UnauthorizedException('GitHub user did not provide an ID');
      }

      return this.loginWithOAuth({
        email: userData.email || `${userData.login}@github.com`,
        fullName: userData.name || userData.login,
        oauthId: userData.id.toString(),
        provider: 'github',
        avatar: userData.avatar_url || '',
      });
    } catch (error) {
      console.error('Error fetching GitHub token:', error);
      throw new UnauthorizedException('Failed to obtain GitHub token');
    }
  }

  private async loginWithOAuth(oauthUser: {
    email: string;
    fullName: string;
    oauthId: string;
    provider: 'google' | 'github';
    avatar: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let user = await this.userRepository.findOne({
      where: { providerId: oauthUser.oauthId, provider: oauthUser.provider },
    });
    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: oauthUser.email },
      });
      if (!user) {
        user = this.userRepository.create({
          email: oauthUser.email,
          fullName: oauthUser.fullName,
          password: '',
          providerId: oauthUser.oauthId,
          provider: oauthUser.provider,
          avatar: oauthUser.avatar,
        });
        await this.userRepository.save(user);
      } else {
        user.providerId = oauthUser.oauthId; // Update providerId
        await this.userRepository.save(user);
      }
    }
    return this.generateTokens(user);
  }

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
    user: User;
  } {
    user.password = '';

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
      secret: config.jwt.accessSecret,
      expiresIn: config.jwt.accessExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: config.jwt.refreshSecret,
      expiresIn: config.jwt.refreshExpiresIn,
    });

    const accessTtl = this.getTtlInSeconds(config.jwt.accessExpiresIn);
    const refreshTtl = this.getTtlInSeconds(config.jwt.refreshExpiresIn);
    this.redisUtil.setToken(`access_token:${user.id}`, accessToken, accessTtl);
    this.redisUtil.setToken(
      `refresh_token:${user.id}`,
      refreshToken,
      refreshTtl,
    );

    return { accessToken, refreshToken, user };
  }

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

  async validateUser(userId: string): Promise<{ sub: string; email: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokenExists = await this.redisUtil.tokenExists(
      `access_token:${userId}`,
    );
    if (!tokenExists) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    return { sub: user.id, email: user.email };
  }
}