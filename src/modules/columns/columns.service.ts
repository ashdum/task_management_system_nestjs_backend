// src/modules/columns/columns.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
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
      throw new NotFoundException(`Дашборд с ID ${dashboardId} не найден`);
    }

    const column = this.columnRepository.create({
      ...columnData,
      dashboard,
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
      throw new NotFoundException(`Колонка с ID ${id} не найдена`);
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

  async remove(id: string): Promise<void> {
    const column = await this.findOne(id);
    await this.columnRepository.remove(column);
  }
}
