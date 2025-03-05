// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body as RequestBody,
  HttpCode,
  HttpStatus,
  Req as CustomRequest,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  JwtAuthGuard,
  JwtRefreshGuard,
} from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';

// DTO for response
class AuthResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ type: User })
  user!: User;
}

class RefreshDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;
}

class LogoutResponse {
  @ApiProperty({ example: 'Logout successful' })
  message!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiBody({ type: RegisterDto })
  async register(@RequestBody() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login and JWT token retrieval' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@RequestBody() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Refresh token not provided' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid' })
  async refreshTokens(
    @RequestBody('refreshToken') refreshToken: string,
    @CustomRequest() req: { user: { sub: string; email: string } },
  ) {
    if (!refreshToken)
      throw new BadRequestException('Refresh token is required');
    return this.authService.refreshTokens(req.user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CustomRequest() req: { user: { sub: string } }) {
    await this.authService.logout(req.user.sub);
    return { message: 'Logout successful' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({
    status: 401,
    description: 'Invalid old password or unauthorized',
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@RequestBody() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login via Google' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        credential: { type: 'string', example: 'google-id-token' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login via Google successful',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async googleLogin(@RequestBody('credential') credential: string) {
    if (!credential)
      throw new BadRequestException('Google credential is required');
    return this.authService.googleLogin(credential);
  }

  @Post('github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { code: { type: 'string', example: 'github-auth-code' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login via GitHub successful',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'GitHub authorization error' })
  async githubCallback(@RequestBody('code') code: string) {
    if (!code) throw new BadRequestException('GitHub code is required');
    return this.authService.githubCall(code);
  }
}