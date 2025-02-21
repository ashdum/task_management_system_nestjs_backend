// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard, JwtRefreshGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Зарегистрировать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Неверный запрос' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Пользователь успешно зарегистрирован', data: user };
  }

  @ApiOperation({ summary: 'Вход пользователя и получение JWT-токенов' })
  @ApiResponse({ status: 200, description: 'Вход успешен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return { message: 'Вход успешен', data: tokens };
  }

  @ApiOperation({ summary: 'Обновление JWT-токенов' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: { user: { sub: string; email: string } }) {
    const tokens = await this.authService.refreshTokens(req.user);
    return { message: 'Токены успешно обновлены', data: tokens };
  }

  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Выход успешен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: { user: { sub: string } }) {
    await this.authService.logout(req.user.sub);
    return { message: 'Выход успешен' };
  }
}