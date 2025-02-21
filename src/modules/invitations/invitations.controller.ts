// src/modules/invitations/invitations.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardInvitation } from './entities/invitation.entity';
import { InvitationsService } from './invitations.service';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new dashboard invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created', type: DashboardInvitation })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createInvitationDto: CreateInvitationDto): Promise<DashboardInvitation> {
    return this.invitationsService.create(createInvitationDto);
  }
}