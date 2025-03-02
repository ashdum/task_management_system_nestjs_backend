import { Column, Entity, ManyToMany, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Card } from '../../cards/entities/card.entity';
import { DashboardInvitation } from '../../invitations/entities/invitation.entity';
import { DashboardUser } from '../../dashboards/entities/dashboard-user.entity';

@Entity('users')
@Index('idx_user_email', ['email'])
@Index('idx_user_provider_providerId', ['provider', 'providerId'], {
  unique: true,
})
export class User extends BaseEntity {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @Column({ unique: true, nullable: false })
  email!: string;

  @ApiProperty({
    description: 'Полное имя пользователя',
    example: 'John Doe',
    required: false,
  })
  @Column({ nullable: true })
  fullName?: string;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({
    description: 'Хешированный пароль (не возвращается)',
    required: false,
  })
  @Column({ nullable: false, select: false })
  password!: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['user', 'admin'],
    default: 'user',
  })
  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: 'user' | 'admin';

  @ApiProperty({
    description: 'Провайдер авторизации',
    enum: ['google', 'github', null],
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ['google', 'github'],
    nullable: true,
    default: null,
  })
  provider?: 'google' | 'github' | null;

  @ApiProperty({
    description: 'Идентификатор провайдера',
    example: 'google-id-123',
    required: false,
  })
  @Column({ nullable: true, default: null })
  providerId?: string;

  @ApiProperty({ description: 'Карточки пользователя', type: () => [Card] })
  @ManyToMany(() => Card, (card) => card.members)
  cards!: Card[];

  @ApiProperty({
    description: 'Отправленные приглашения',
    type: () => [DashboardInvitation],
  })
  @OneToMany(() => DashboardInvitation, (invitation) => invitation.inviter)
  sentInvitations!: DashboardInvitation[];

  @ApiProperty({
    description: 'Связи с дашбордами',
    type: () => [DashboardUser],
  })
  @OneToMany(() => DashboardUser, (dashboardUser) => dashboardUser.user)
  dashboardUsers!: DashboardUser[];
}
