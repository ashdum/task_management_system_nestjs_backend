import 'reflect-metadata'; // Заменяем require на import
import { DataSource } from 'typeorm';
import config from './config/config';
import { Dashboard } from './modules/dashboards/entities/dashboard.entity';
import { DashboardUser } from './modules/dashboards/entities/dashboard-user.entity';
import { ColumnEntity } from './modules/columns/entities/column.entity';
import { Card } from './modules/cards/entities/card.entity';
import { DashboardInvitation } from './modules/invitations/entities/invitation.entity';
import { Label } from './modules/cards/entities/label.entity';
import { Checklist } from './modules/cards/entities/checklist.entity';
import { ChecklistItem } from './modules/cards/entities/checklist-item.entity';
import { CardComment } from './modules/cards/entities/comment.entity';
import { Attachment } from './modules/cards/entities/attachment.entity';
import { User } from './modules/users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  entities: [
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
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

