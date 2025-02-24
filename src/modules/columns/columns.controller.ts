// src/modules/columns/columns.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
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
} from '@nestjs/swagger';
import { ColumnEntity } from './entities/column.entity';

@ApiTags('Columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую колонку' })
  @ApiResponse({
    status: 201,
    description: 'Колонка создана',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  create(@Body() createColumnDto: CreateColumnDto): Promise<ColumnEntity> {
    return this.columnsService.create(createColumnDto);
  }

  @Get('dashboard/:dashboardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все колонки дашборда' })
  @ApiResponse({
    status: 200,
    description: 'Список колонок',
    type: [ColumnEntity],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAllByDashboard(
    @Param('dashboardId') dashboardId: string,
  ): Promise<ColumnEntity[]> {
    return this.columnsService.findAllByDashboard(dashboardId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить колонку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Детали колонки',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id') id: string): Promise<ColumnEntity> {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить колонку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Колонка обновлена',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnEntity> {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить колонку по ID (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Колонка удалена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id') id: string): Promise<void> {
    return this.columnsService.remove(id);
  }
}
