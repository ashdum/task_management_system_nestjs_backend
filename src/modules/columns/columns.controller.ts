// src/modules/columns/columns.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body as RequestBody,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ColumnEntity } from './entities/column.entity';

@ApiTags('Columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать новую колонку' })
  @ApiBody({ type: CreateColumnDto })
  @ApiResponse({
    status: 201,
    description: 'Колонка создана',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к дашборду' })
  create(
    @RequestBody() createColumnDto: CreateColumnDto,
  ): Promise<ColumnEntity> {
    return this.columnsService.create(createColumnDto);
  }

  @Get('dashboard/:dashboardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить все колонки дашборда' })
  @ApiResponse({
    status: 200,
    description: 'Список колонок',
    type: [ColumnEntity],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Дашборд не найден' })
  findAllByDashboard(
    @Param('dashboardId') dashboardId: string,
  ): Promise<ColumnEntity[]> {
    return this.columnsService.findAllByDashboard(dashboardId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить колонку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Детали колонки',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  findOne(@Param('id') id: string): Promise<ColumnEntity> {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить колонку по ID' })
  @ApiBody({ type: UpdateColumnDto })
  @ApiResponse({
    status: 200,
    description: 'Колонка обновлена',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к колонке' })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  update(
    @Param('id') id: string,
    @RequestBody() updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnEntity> {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить колонку по ID (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Колонка удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Только администратор может удалить колонку',
  })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  remove(@Param('id') id: string): Promise<void> {
    return this.columnsService.remove(id);
  }
}
