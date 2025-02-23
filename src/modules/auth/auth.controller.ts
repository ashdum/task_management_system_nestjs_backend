// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard, JwtRefreshGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OAuth2Client } from 'google-auth-library'; // Исправленный импорт

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Зарегистрировать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
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
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление JWT-токенов' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async refreshTokens(@Request() req: { user: { sub: string; email: string } }) {
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
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен, возвращены новые токены' })
  @ApiResponse({ status: 401, description: 'Не авторизован или неверный старый пароль' })
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
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error('Неверный токен Google');

    const user = await this.authService.loginWithGoogle({
      email: payload.email,
      fullName: payload.name || payload.email.split('@')[0],
      googleId: payload.sub,
    });
    return user;
  }

  @Post('github/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'Вход через GitHub успешен' })
  @ApiResponse({ status: 400, description: 'Ошибка авторизации GitHub' })
  async githubCallback(@Body('code') code: string) {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('Ошибка получения токена GitHub');

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    const user = await this.authService.loginWithGithub({
      email: userData.email || `${userData.login}@github.com`,
      fullName: userData.name || userData.login,
      githubId: userData.id.toString(),
    });
    return user;
  }
}