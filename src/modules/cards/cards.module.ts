// src/modules/cards/cards.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Label } from './entities/label.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      Label,
      Checklist,
      ChecklistItem,
      Comment,
      Attachment,
      ColumnEntity,
      User,
    ]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
