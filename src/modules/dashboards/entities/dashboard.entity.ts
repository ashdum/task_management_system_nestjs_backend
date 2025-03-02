import { Column, Entity, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { DashboardInvitation } from '../../invitations/entities/invitation.entity';
import { DashboardUser } from './dashboard-user.entity';

export interface DashboardSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowInvites: boolean;
  theme?: string;
}

@Entity('dashboards')
export class Dashboard extends BaseEntity {
  @ApiProperty({
    description: 'Title of the dashboard',
    example: 'My Project Dashboard',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'List of owner IDs (UUIDs)',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @Column('uuid', { array: true })
  @Index('idx_dashboards_ownerIds')
  ownerIds!: string[];

  @ApiProperty({
    description: 'Users associated with the dashboard',
    type: () => [DashboardUser],
  })
  @OneToMany(() => DashboardUser, (dashboardUser) => dashboardUser.dashboard, {
    cascade: true,
  })
  dashboardUsers!: DashboardUser[];

  @ApiProperty({ description: 'List of columns', type: () => [ColumnEntity] })
  @OneToMany(() => ColumnEntity, (column) => column.dashboard, {
    cascade: true,
  })
  columns!: ColumnEntity[];

  @ApiProperty({
    description: 'Background color or image URL',
    example: '#FFFFFF',
    required: false,
  })
  @Column({ nullable: true })
  background?: string;

  @ApiProperty({
    description: 'Description of the dashboard',
    example: 'Dashboard for project management',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Is the dashboard public?',
    example: false,
    required: false,
  })
  @Column({ default: false })
  isPublic?: boolean;

  @ApiProperty({
    description: 'Dashboard settings',
    example: {
      isPublic: false,
      allowComments: true,
      allowInvites: true,
      theme: 'light',
    },
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  settings?: DashboardSettings;

  @ApiProperty({
    description: 'List of invitations',
    type: () => [DashboardInvitation],
  })
  @OneToMany(() => DashboardInvitation, (invitation) => invitation.dashboard, {
    cascade: true,
  })
  invitations!: DashboardInvitation[];
}
