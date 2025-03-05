import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Label } from './entities/label.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { CardComment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { LabelsService } from './labels.service';
import { ChecklistsService } from './checklists.service';
import { ChecklistItemsService } from './checklist-items.service';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      Label,
      Checklist,
      ChecklistItem,
      CardComment,
      Attachment,
      ColumnEntity,
      User,
      Dashboard,
    ]),
  ],
  controllers: [CardsController],
  providers: [
    CardsService,
    LabelsService,
    ChecklistsService,
    ChecklistItemsService,
    CommentsService,
  ],
  exports: [
    CardsService,
    LabelsService,
    ChecklistsService,
    ChecklistItemsService,
    CommentsService,
    TypeOrmModule,
  ],
})
export class CardsModule {}