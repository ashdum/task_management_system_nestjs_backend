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
import { UpdateOrderDto } from './dto/update-order.dto';
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
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new column' })
  @ApiBody({ type: CreateColumnDto })
  @ApiResponse({
    status: 201,
    description: 'Column created successfully',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the dashboard' })
  create(
    @RequestBody() createColumnDto: CreateColumnDto,
  ): Promise<ColumnEntity> {
    return this.columnsService.create(createColumnDto);
  }

  @Get('dashboard/:dashboardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all columns for a dashboard' })
  @ApiResponse({
    status: 200,
    description: 'List of columns',
    type: [ColumnEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  findAllByDashboard(
    @Param('dashboardId') dashboardId: string,
  ): Promise<ColumnEntity[]> {
    return this.columnsService.findAllByDashboard(dashboardId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a column by ID' })
  @ApiResponse({
    status: 200,
    description: 'Column details',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  findOne(@Param('id') id: string): Promise<ColumnEntity> {
    return this.columnsService.findOne(id);
  }

  @Patch('order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update the order of columns for a dashboard' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Column order updated successfully',
    type: [ColumnEntity],
  })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Dashboard or columns not found' })
  async updateOrder(
    @RequestBody() updateOrderDto: UpdateOrderDto,
  ): Promise<ColumnEntity[]> {
    return this.columnsService.updateOrder(updateOrderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a column by ID' })
  @ApiBody({ type: UpdateColumnDto })
  @ApiResponse({
    status: 200,
    description: 'Column updated successfully',
    type: ColumnEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the column' })
  @ApiResponse({ status: 404, description: 'Column not found' })
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
    summary: 'Delete a column by ID (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Only an admin can delete a column',
  })
  @ApiResponse({ status: 404, description: 'Column not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.columnsService.remove(id);
  }
}