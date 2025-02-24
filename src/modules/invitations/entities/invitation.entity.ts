// src/modules/invitations/entities/invitation.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Dashboard } from '../../dashboards/entities/dashboard.entity';

@Entity('dashboard_invitations')
export class DashboardInvitation extends BaseEntity {
  @ApiProperty({
    description: 'ID of the dashboard',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  dashboardId!: string;

  @ApiProperty({
    description: 'ID of the inviter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  inviterId!: string;

  @ApiProperty({
    description: 'Email of the inviter',
    example: 'inviter@example.com',
  })
  @Column()
  inviterEmail!: string;

  @ApiProperty({
    description: 'Email of the invitee',
    example: 'invitee@example.com',
  })
  @Column()
  inviteeEmail!: string;

  @ApiProperty({ description: 'Status of the invitation', example: 'pending' })
  @Column({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status!: 'pending' | 'accepted' | 'rejected';

  // Relationships
  @ManyToOne(() => Dashboard, (dashboard) => dashboard.invitations)
  @JoinColumn({ name: 'dashboardId' })
  dashboard!: Dashboard;

  @ManyToOne(() => User, (user) => user.sentInvitations)
  @JoinColumn({ name: 'inviterId' })
  inviter!: User;
}
