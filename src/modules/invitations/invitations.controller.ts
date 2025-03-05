import {
  Controller,
  Post,
  Body as RequestBody,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DashboardInvitation } from './entities/invitation.entity';
import { InvitationsService } from './invitations.service';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: { sub: string; email: string };
}

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invitation to a dashboard' })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: DashboardInvitation,
  })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the dashboard' })
  create(
    @RequestBody() createInvitationDto: CreateInvitationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<DashboardInvitation> {
    return this.invitationsService.create(
      createInvitationDto,
      req.user.sub,
      req.user.email,
    );
  }
}