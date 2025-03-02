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

// DTO для ответа
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
  @ApiProperty({ example: 'Выход успешен' })
  message!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Зарегистрировать нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  @ApiBody({ type: RegisterDto })
  async register(@RequestBody() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход пользователя и получение JWT-токенов' })
  @ApiResponse({ status: 200, description: 'Вход успешен', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiBody({ type: LoginDto })
  async login(@RequestBody() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление JWT-токенов' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Refresh-токен не предоставлен' })
  @ApiResponse({ status: 401, description: 'Refresh-токен недействителен' })
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
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Выход успешен',
    type: LogoutResponse,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async logout(@CustomRequest() req: { user: { sub: string } }) {
    await this.authService.logout(req.user.sub);
    return { message: 'Выход успешен' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Смена пароля пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно изменен',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  @ApiResponse({
    status: 401,
    description: 'Неверный старый пароль или не авторизован',
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
  @ApiOperation({ summary: 'Вход через Google' })
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
    description: 'Вход через Google успешен',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Неверный токен Google' })
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
    description: 'Вход через GitHub успешен',
    type: AuthResponse,
  })
  @ApiResponse({ status: 400, description: 'Ошибка авторизации GitHub' })
  async githubCallback(@RequestBody('code') code: string) {
    if (!code) throw new BadRequestException('GitHub code is required');
    return this.authService.githubCall(code);
  }
}
