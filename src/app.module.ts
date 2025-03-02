import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { redisConfig } from './config/redis.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { CardsModule } from './modules/cards/cards.module';
import { databaseConfig } from './config/database.config';

console.log(
  'Database Config Entities:',
  databaseConfig.entities
    ? (databaseConfig.entities as Function[]).map((e) => e.name)
    : 'Entities are undefined',
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    BullModule.forRoot({
      redis: redisConfig,
    }),
    AuthModule,
    UsersModule,
    InvitationsModule,
    DashboardsModule,
    ColumnsModule,
    CardsModule,
  ],
  controllers: [],
})
export class AppModule {}