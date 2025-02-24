// src/modules/users/entities/user.entity.ts
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DashboardInvitation } from 'src/modules/invitations/entities/invitation.entity';
import { Card } from 'src/modules/cards/entities/card.entity';
import { DashboardUser } from 'src/modules/dashboards/entities/dashboard-user.entity';

@Entity('users')
@Index('idx_user_email', ['email'])
@Index('idx_user_provider_providerId', ['provider', 'providerId'], {
  unique: true,
}) // Уникальный индекс для provider + providerId
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  @ApiProperty({ description: 'Email пользователя' })
  email!: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Полное имя пользователя' })
  fullName?: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'URL аватара пользователя (может быть из Google/GitHub)',
  })
  avatar?: string;

  @ApiProperty({
    description: 'Хешированный пароль пользователя (не возвращается в ответах)',
    required: false,
  })
  @Column({ nullable: false, select: false })
  password!: string;

  @Column({ default: 'user', enum: ['user', 'admin'] })
  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role!: string;

  @Column({
    type: 'enum',
    enum: ['google', 'github'],
    nullable: true,
    default: null,
  })
  @ApiProperty({
    description:
      'Провайдер авторизации (например, "google", "github", или null для email/password)',
    enum: ['google', 'github', null],
  })
  provider?: 'google' | 'github' | null;

  @Column({ nullable: true, default: null })
  @ApiProperty({
    description:
      'Идентификатор пользователя у провайдера (Google или GitHub ID)',
  })
  providerId?: string;

  @OneToMany(() => DashboardInvitation, (invitation) => invitation.inviter)
  @ApiProperty({ description: 'Отправленные приглашения пользователя' })
  sentInvitations!: DashboardInvitation[];

  @OneToMany(() => DashboardUser, (dashboardUser) => dashboardUser.user)
  @ApiProperty({ description: 'Связи пользователя с дашбордами' })
  dashboardUsers!: DashboardUser[];

  @ManyToMany(() => Card, (card) => card.members)
  @ApiProperty({ description: 'Карточки, к которым пользователь имеет доступ' })
  cards!: Card[];
}
