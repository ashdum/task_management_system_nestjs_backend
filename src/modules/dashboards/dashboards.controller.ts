// src/modules/dashboards/dashboards.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
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
} from '@nestjs/swagger';
import { Dashboard } from './entities/dashboard.entity';

// Интерфейс для расширения Request с учетом user из JWT
interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string }; // Структура, возвращаемая JwtStrategy
}

@ApiTags('Dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый дашборд' })
  @ApiResponse({ status: 201, description: 'Дашборд создан', type: Dashboard })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  create(
    @Body() createDashboardDto: CreateDashboardDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Dashboard> {
    if (!req.user)
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    const userId = req.user.sub; // Теперь TypeScript знает, что user существует и содержит sub
    return this.dashboardsService.create(createDashboardDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все дашборды текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список дашбордов',
    type: [Dashboard],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(): Promise<Dashboard[]> {
    return this.dashboardsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить дашборд по ID' })
  @ApiResponse({ status: 200, description: 'Детали дашборда', type: Dashboard })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id') id: string): Promise<Dashboard> {
    return this.dashboardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить дашборд по ID' })
  @ApiResponse({
    status: 200,
    description: 'Дашборд обновлен',
    type: Dashboard,
  })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ): Promise<Dashboard> {
    return this.dashboardsService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить дашборд по ID (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Дашборд удален' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dashboardsService.remove(id);
  }
}
