// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
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
} from '@nestjs/swagger';

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
  })
  @ApiResponse({ status: 400, description: 'Неверный запрос' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход пользователя и получение JWT-токенов' })
  @ApiResponse({ status: 200, description: 'Вход успешен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async login(@Body() loginDto: LoginDto) {
    const res = this.authService.login(loginDto);
    return  res;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление JWT-токенов' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async refreshTokens(
    @Request() req: { user: { sub: string; email: string } },
  ) {
    return this.authService.refreshTokens(req.user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiResponse({ status: 200, description: 'Выход успешен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async logout(@Request() req: { user: { sub: string } }) {
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
    description: 'Пароль успешно изменен, возвращены новые токены',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован или неверный старый пароль',
  })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход через Google' })
  @ApiResponse({ status: 200, description: 'Вход через Google успешен' })
  @ApiResponse({ status: 400, description: 'Неверный токен Google' })
  async googleLogin(@Body('credential') credential: string) {
    return this.authService.googleLogin(credential);
  }

  @Post('github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'Вход через GitHub успешен' })
  @ApiResponse({ status: 400, description: 'Ошибка авторизации GitHub' })
  async githubCallback(@Body('code') code: string) {
    return this.authService.githubCall(code);
  }
}
