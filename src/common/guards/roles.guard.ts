// src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardUser } from '../../modules/dashboards/entities/dashboard-user.entity';
import { ColumnEntity } from '../../modules/columns/entities/column.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(DashboardUser)
    private readonly dashboardUserRepository: Repository<DashboardUser>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Из JWT
    /* if (!user) {
      return true;
    } */
    let dashboardId = request.params.id || request.body.dashboardId;

    if (request.params.id && !dashboardId) {
      const column = await this.columnRepository.findOne({
        where: { id: request.params.id },
        relations: ['dashboard'],
      });
      if (column) {
        dashboardId = column.dashboard.id;
      }
    }

    if (!dashboardId) {
      throw new ForbiddenException('ID дашборда не указан');
    }

    const dashboardUser = await this.dashboardUserRepository.findOne({
      where: { user: { id: user.sub }, dashboard: { id: dashboardId } },
    });

    if (!dashboardUser || dashboardUser.role !== 'admin') {
      throw new ForbiddenException(
        'Только администратор может выполнить это действие',
      );
    }

    return true;
  }
}
