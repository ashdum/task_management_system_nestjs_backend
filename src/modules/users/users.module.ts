// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export service for use in other modules (e.g., auth)
})
export class UsersModule {}