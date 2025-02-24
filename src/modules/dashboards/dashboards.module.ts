// src/modules/dashboards/dashboards.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { Dashboard } from './entities/dashboard.entity';
import { DashboardUser } from './entities/dashboard-user.entity';
import { User } from '../users/entities/user.entity';
import { ColumnsModule } from '../columns/columns.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dashboard, DashboardUser, User]),
    ColumnsModule,
  ],
  controllers: [DashboardsController],
  providers: [DashboardsService, RolesGuard],
})
export class DashboardsModule {}
