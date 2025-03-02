import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardUser } from './entities/dashboard-user.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(DashboardUser)
    private readonly dashboardUserRepository: Repository<DashboardUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(
    createDashboardDto: CreateDashboardDto,
    userId: string,
  ): Promise<Dashboard> {
    const user = await this.userRepository
      .findOneOrFail({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
      });

    const dashboard = this.dashboardRepository.create({
      ...createDashboardDto,
      ownerIds: [userId],
      columns: [],
      invitations: [],
    });

    const savedDashboard = await this.dashboardRepository.save(dashboard);

    const dashboardUser = this.dashboardUserRepository.create({
      user,
      dashboard: savedDashboard,
      role: 'admin',
    });
    await this.dashboardUserRepository.save(dashboardUser);

    return savedDashboard;
  }

  async findAll(userId: string): Promise<Dashboard[]> {
    const dashboardUsers = await this.dashboardUserRepository.find({
      where: { user: { id: userId } },
      relations: ['dashboard'],
    });

    const dashboardIds = dashboardUsers.map((du) => du.dashboard.id);
    if (dashboardIds.length === 0) {
      return [];
    }

    return this.dashboardRepository.find({
      where: { id: In(dashboardIds) },
      relations: ['dashboardUsers', 'columns', 'columns.cards', 'invitations'],
    });
  }

  async findOne(id: string): Promise<Dashboard> {
    try {
      const dashboard = await this.dashboardRepository.findOneOrFail({
        where: { id },
        relations: [
          'dashboardUsers',
          'columns',
          'columns.cards',
          'columns.cards.members',
          'columns.cards.labels',
          'columns.cards.checklists',
          'columns.cards.checklists.items',
          'columns.cards.comments',
          'columns.cards.attachments',
          'invitations',
        ],
      });
      return dashboard;
    } catch {
      throw new NotFoundException(`Дашборд с ID ${id} не найден`);
    }
  }

  async update(
    id: string,
    updateDashboardDto: UpdateDashboardDto,
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(id);
    Object.assign(dashboard, updateDashboardDto);
    return this.dashboardRepository.save(dashboard);
  }

  async remove(id: string): Promise<void> {
    const dashboard = await this.findOne(id);

    // Удаляем все связанные записи из dashboard_users
    await this.dashboardUserRepository.delete({ dashboard: { id } });

    // Удаляем сам дашборд
    await this.dashboardRepository.remove(dashboard);
  }
}