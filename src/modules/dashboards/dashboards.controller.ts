// src/modules/dashboards/dashboards.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body as RequestBody,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Dashboard } from './entities/dashboard.entity';

interface AuthenticatedRequest extends ExpressRequest {
  user: { sub: string; email: string };
}

@ApiTags('Dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать новый дашборд' })
  @ApiBody({
    type: CreateDashboardDto,
    examples: {
      example1: {
        value: {
          title: 'My Dashboard',
          ownerIds: ['123e4567-e89b-12d3-a456-426614174000'],
          settings: {
            isPublic: false,
            allowComments: true,
            allowInvites: true,
            theme: 'light',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Дашборд создан', type: Dashboard })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  create(
    @RequestBody() createDashboardDto: CreateDashboardDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Dashboard> {
    if (!req.user)
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    return this.dashboardsService.create(createDashboardDto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить дашборды текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список дашбордов пользователя',
    type: [Dashboard],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(@Req() req: AuthenticatedRequest): Promise<Dashboard[]> {
    return this.dashboardsService.findAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить дашборд по ID' })
  @ApiResponse({ status: 200, description: 'Детали дашборда', type: Dashboard })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  findOne(@Param('id') id: string): Promise<Dashboard> {
    return this.dashboardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить дашборд по ID' })
  @ApiBody({ type: UpdateDashboardDto })
  @ApiResponse({
    status: 200,
    description: 'Дашборд обновлен',
    type: Dashboard,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к дашборду' })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  update(
    @Param('id') id: string,
    @RequestBody() updateDashboardDto: UpdateDashboardDto,
  ): Promise<Dashboard> {
    return this.dashboardsService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить дашборд по ID (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Дашборд удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Только администратор может удалить дашборд',
  })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dashboardsService.remove(id);
  }
}
