import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItem } from './entities/checklist-item.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItemDto } from './dto/update-card.dto';

@Injectable()
export class ChecklistItemsService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
  ) {}

  async findAllByChecklistId(checklistId: string): Promise<ChecklistItem[]> {
    return this.checklistItemRepository.find({
      where: { checklist: { id: checklistId } },
    });
  }

  async save(checklist: Checklist, itemDtos: ChecklistItemDto[]): Promise<ChecklistItem[]> {
    // Delete all existing items for the checklist using a single DELETE query
    await this.checklistItemRepository
      .createQueryBuilder()
      .delete()
      .from(ChecklistItem)
      .where('checklistId = :checklistId', { checklistId: checklist.id })
      .execute();

    // Create new items
    const newItems = itemDtos.map((itemDto) =>
      this.checklistItemRepository.create({
        text: itemDto.text,
        completed: itemDto.completed || false,
        checklist,
      }),
    );

    // Save the new items
    if (newItems.length > 0) {
      await this.checklistItemRepository.save(newItems);
    }

    return newItems;
  }
}