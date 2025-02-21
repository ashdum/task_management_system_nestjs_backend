// src/modules/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { DashboardInvitation } from './entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardInvitation])],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}