import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Label } from './entities/label.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { CardComment } from './entities/comment.entity'; // Обновляем Comment → CardComment
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
      CardComment, // Обновляем Comment → CardComment
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
