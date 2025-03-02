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
  @ApiOperation({ summary: 'Создать новое приглашение в дашборд' })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Приглашение создано',
    type: DashboardInvitation,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к дашборду' })
  create(
    @RequestBody() createInvitationDto: CreateInvitationDto, // Убираем псевдоним Body
    @Req() req: AuthenticatedRequest,
  ): Promise<DashboardInvitation> {
    return this.invitationsService.create(
      createInvitationDto,
      req.user.sub,
      req.user.email,
    );
  }
}
