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
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: { sub: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(DashboardUser)
    private readonly dashboardUserRepository: Repository<DashboardUser>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    const params = request.params as { id?: string };
    const body = request.body as { dashboardId?: string };
    let dashboardId: string | undefined;

    console.log('User sub:', user.sub);
    console.log('Params:', params, 'Body:', body);

    // Если есть dashboardId в теле запроса (например, для POST /columns)
    if (body && body.dashboardId) {
      dashboardId = body.dashboardId;
    }
    // Если params.id присутствует (для DELETE /columns/:id или DELETE /dashboards/:id)
    else if (params.id) {
      // Проверяем, является ли params.id ID колонки
      const column = await this.columnRepository.findOne({
        where: { id: params.id },
        relations: ['dashboard'],
      });
      console.log('Column found:', column);
      if (column) {
        dashboardId = column.dashboard.id; // Извлекаем dashboardId из колонки
      } else {
        // Если это не колонка, предполагаем, что params.id — это dashboardId (для DELETE /dashboards/:id)
        dashboardId = params.id;
      }
    }

    console.log('Dashboard ID:', dashboardId);

    if (!dashboardId) {
      throw new ForbiddenException('ID дашборда не указан');
    }

    const dashboardUser = await this.dashboardUserRepository.findOne({
      where: { user: { id: user.sub }, dashboard: { id: dashboardId } },
    });

    console.log('Dashboard User:', dashboardUser);

    if (!dashboardUser || dashboardUser.role !== 'admin') {
      throw new ForbiddenException('Только администратор может выполнить это действие');
    }

    return true;
  }
}