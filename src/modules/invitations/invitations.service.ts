import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardInvitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(DashboardInvitation)
    private readonly invitationRepository: Repository<DashboardInvitation>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    inviterId: string,
    inviterEmail: string,
  ): Promise<DashboardInvitation> {
    const { dashboardId, inviteeEmail, status } = createInvitationDto;

    // Находим dashboard по ID
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard) {
      throw new NotFoundException(`Дашборд с ID ${dashboardId} не найден`);
    }

    // Находим inviter по ID
    const inviter = await this.userRepository.findOne({
      where: { id: inviterId },
    });
    if (!inviter) {
      throw new NotFoundException(`Пользователь с ID ${inviterId} не найден`);
    }

    const invitation = this.invitationRepository.create({
      dashboard, // Используем свойство dashboard
      inviter, // Используем свойство inviter
      inviterEmail,
      inviteeEmail,
      status,
    });

    return this.invitationRepository.save(invitation);
  }
}
