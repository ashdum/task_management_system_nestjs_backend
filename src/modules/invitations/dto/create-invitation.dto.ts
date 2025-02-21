// src/modules/invitations/dto/create-invitation.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ description: 'ID of the dashboard', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  dashboardId!: string;

  @ApiProperty({ description: 'Email of the invitee', example: 'invitee@example.com' })
  @IsEmail()
  inviteeEmail!: string;

  @ApiProperty({ description: 'Status of the invitation', example: 'pending', enum: ['pending', 'accepted', 'rejected'] })
  @IsEnum(['pending', 'accepted', 'rejected'])
  status!: 'pending' | 'accepted' | 'rejected';
}