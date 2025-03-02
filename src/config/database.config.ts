import 'reflect-metadata'; // Добавляем в начало файла
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from './config';
import { BaseEntity } from 'common/entities/base.entity';
import { User } from 'modules/users/entities/user.entity';
import { Dashboard } from 'modules/dashboards/entities/dashboard.entity';
import { DashboardUser } from 'modules/dashboards/entities/dashboard-user.entity';
import { ColumnEntity } from 'modules/columns/entities/column.entity';
import { Card } from 'modules/cards/entities/card.entity';
import { DashboardInvitation } from 'modules/invitations/entities/invitation.entity';
import { Label } from 'modules/cards/entities/label.entity';
import { Checklist } from 'modules/cards/entities/checklist.entity';
import { ChecklistItem } from 'modules/cards/entities/checklist-item.entity';
import { Attachment } from 'modules/cards/entities/attachment.entity';
import { CardComment } from 'modules/cards/entities/comment.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  entities: [
    BaseEntity,
    User,
    Dashboard,
    DashboardUser,
    ColumnEntity,
    Card,
    DashboardInvitation,
    Label,
    Checklist,
    ChecklistItem,
    CardComment,
    Attachment,
  ],
  migrations: ['./src/database/migrations/*.ts'],
  synchronize: true,
};
