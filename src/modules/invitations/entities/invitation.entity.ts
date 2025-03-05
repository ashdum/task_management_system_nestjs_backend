import { Column, Entity, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Dashboard } from '../../dashboards/entities/dashboard.entity';

@Entity('dashboard_invitations')
export class DashboardInvitation extends BaseEntity {
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

  @ApiProperty({
    description: 'Status of the invitation',
    example: 'pending',
    enum: ['pending', 'accepted', 'rejected'],
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status!: 'pending' | 'accepted' | 'rejected';

  @ApiProperty({
    description: 'Dashboard the invitation belongs to',
    type: () => Dashboard,
  })
  @ManyToOne(() => Dashboard, (dashboard) => dashboard.invitations)
  @Index('idx_dashboard_invitations_dashboardId')
  dashboard!: Dashboard;

  @ApiProperty({
    description: 'User who sent the invitation',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.sentInvitations)
  @Index('idx_dashboard_invitations_inviterId')
  inviter!: User;
}