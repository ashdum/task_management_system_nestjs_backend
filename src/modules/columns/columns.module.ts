// src/modules/columns/columns.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { DashboardUser } from '../dashboards/entities/dashboard-user.entity';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Dashboard, DashboardUser])],
  controllers: [ColumnsController],
  providers: [ColumnsService, RolesGuard],
  exports: [ColumnsService, TypeOrmModule],
})
export class ColumnsModule {}
