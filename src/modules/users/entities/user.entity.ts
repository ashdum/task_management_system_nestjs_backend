// src/modules/users/entities/user.entity.ts
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DashboardInvitation } from 'src/modules/invitations/entities/invitation.entity';
import { Card } from 'src/modules/cards/entities/card.entity';
import { DashboardUser } from 'src/modules/dashboards/entities/dashboard-user.entity';

@Entity('users')
@Index('idx_user_email', ['email'])
export class User extends BaseEntity {

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Column({ unique: true, nullable: false })
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @Column({ nullable: true })
  fullName?: string;

  @ApiProperty({
    description: 'URL to user avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: false, select: false })
  password!: string;

  @ApiProperty({
    description: 'Default user role',
    example: 'user',
    enum: ['user', 'admin'],
    default: 'user',
  })
  @Column({ default: 'user', enum: ['user', 'admin'] })
  role!: string;

  @ApiProperty({
    description: 'List of invitations sent by the user',
    type: () => [DashboardInvitation],
    required: false,
  })
  @OneToMany(() => DashboardInvitation, (invitation) => invitation.inviter)
  sentInvitations!: DashboardInvitation[];

  @ApiProperty({
    description: 'List of dashboard-user associations',
    type: () => [DashboardUser],
    required: false,
  })
  @OneToMany(() => DashboardUser, (dashboardUser) => dashboardUser.user)
  dashboardUsers!: DashboardUser[];

  @ApiProperty({
    description: 'List of cards the user is assigned to',
    type: () => [Card],
    required: false,
  })
  @ManyToMany(() => Card, (card) => card.members)
  cards!: Card[];
}