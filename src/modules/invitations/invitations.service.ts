// src/modules/invitations/invitations.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardInvitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(DashboardInvitation)
    private readonly invitationRepository: Repository<DashboardInvitation>,
  ) {}

  async create(createInvitationDto: CreateInvitationDto): Promise<DashboardInvitation> {
    const invitation = this.invitationRepository.create({
      ...createInvitationDto,
      inviterId: 'current-user-id-from-jwt', // Здесь нужно получить ID текущего пользователя из JWT токена
      inviterEmail: 'current-user-email', // Аналогично из JWT или базы
    });
    return this.invitationRepository.save(invitation);
  }
}