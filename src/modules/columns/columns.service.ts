import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateOrderDto } from './dto/update-order.dto'; // Import the new DTO
import { Dashboard } from '../dashboards/entities/dashboard.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<ColumnEntity> {
    const { dashboardId, ...columnData } = createColumnDto;
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }

    // Calculate the next order based on existing columns
    const existingColumnsCount = await this.columnRepository.count({
      where: { dashboard: { id: dashboardId } },
    });
    const nextOrder = existingColumnsCount + 1;

    const column = this.columnRepository.create({
      ...columnData,
      order: nextOrder, // Set the calculated order
      dashboard, // Assign the dashboard
    });

    return this.columnRepository.save(column);
  }

  async findAllByDashboard(dashboardId: string): Promise<ColumnEntity[]> {
    return this.columnRepository.find({
      where: { dashboard: { id: dashboardId } },
      relations: ['cards'],
    });
  }

  async findOne(id: string): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ['cards', 'dashboard'],
    });
    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
    return column;
  }

  async update(
    id: string,
    updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnEntity> {
    const column = await this.findOne(id);
    Object.assign(column, updateColumnDto);
    return this.columnRepository.save(column);
  }

  async updateOrder(updateOrderDto: UpdateOrderDto): Promise<ColumnEntity[]> {
    const { dashboardId, columnIds } = updateOrderDto;

    // Validate that the dashboard exists
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }

    // Fetch all columns for the dashboard
    const columns = await this.columnRepository.find({
      where: { dashboard: { id: dashboardId } },
    });

    // Validate that all provided columnIds exist and belong to the dashboard
    const columnMap = new Map(columns.map(col => [col.id, col]));
    const invalidIds = columnIds.filter(id => !columnMap.has(id));
    if (invalidIds.length > 0) {
      throw new NotFoundException(`Columns with IDs ${invalidIds.join(', ')} not found`);
    }

    // Validate that the provided columnIds cover all columns in the dashboard
    if (columnIds.length !== columns.length) {
      throw new BadRequestException(
        `Provided column IDs do not match the total number of columns in the dashboard. Expected ${columns.length}, but got ${columnIds.length}`,
      );
    }

    // Check for duplicate columnIds
    const uniqueColumnIds = new Set(columnIds);
    if (uniqueColumnIds.size !== columnIds.length) {
      throw new BadRequestException('Duplicate column IDs are not allowed');
    }

    // Update the order of each column based on its position in columnIds
    const updatedColumns = columnIds.map((id, index) => {
      const column = columnMap.get(id)!;
      column.order = index + 1; // Orders start from 1
      return column;
    });

    // Save all updated columns
    return this.columnRepository.save(updatedColumns);
  }

  async remove(id: string): Promise<void> {
    const column = await this.findOne(id);
    await this.columnRepository.remove(column);
  }
}