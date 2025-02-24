// src/modules/dashboards/entities/dashboard-user.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Dashboard } from './dashboard.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dashboard_users')
export class DashboardUser {
  @ApiProperty({ description: 'Unique identifier', example: 'id' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'User associated with the dashboard',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.dashboardUsers)
  user!: User;

  @ApiProperty({
    description: 'Dashboard associated with the user',
    type: () => Dashboard,
  })
  @ManyToOne(() => Dashboard, (dashboard) => dashboard.dashboardUsers)
  dashboard!: Dashboard;

  @ApiProperty({
    description: 'Role of the user in this dashboard',
    example: 'admin',
    enum: ['user', 'admin'],
  })
  @Column({ enum: ['user', 'admin'], default: 'user' })
  role!: string;
}
