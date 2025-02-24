// src/app.module.ts
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
import { APP_GUARD } from '@nestjs/core';
const { databaseConfig } = require('./config/database.config');

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
 /*  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Глобальный guard (опционально)
    },
  ], */
})
export class AppModule {}
