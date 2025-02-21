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
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto); // Возвращаем только токены
  }

  @ApiOperation({ summary: 'Вход пользователя и получение JWT-токенов' })
  @ApiResponse({ status: 200, description: 'Вход успешен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto); // Возвращаем только токены
  }

  @ApiOperation({ summary: 'Обновление JWT-токенов' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: { user: { sub: string; email: string } }) {
    return this.authService.refreshTokens(req.user); // Возвращаем только токены
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
    return { message: 'Выход успешен' }; // Оставляем сообщение, так как тело не важно
  }
}