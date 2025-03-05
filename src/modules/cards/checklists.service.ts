import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from './entities/checklist.entity';
import { Card } from './entities/card.entity';
import { ChecklistDto } from './dto/update-card.dto';
import { ChecklistItemsService } from './checklist-items.service';

@Injectable()
export class ChecklistsService {
    constructor(
        @InjectRepository(Checklist)
        private readonly checklistRepository: Repository<Checklist>,
        private readonly checklistItemsService: ChecklistItemsService,
    ) { }

    async findAllByCardId(cardId: string): Promise<Checklist[]> {
        return this.checklistRepository.find({
            where: { card: { id: cardId } },
            relations: ['items'],
        });
    }

    async save(card: Card, checklistDtos: ChecklistDto[]): Promise<Checklist[]> {
        // Delete all existing checklists for the card using a single DELETE query
        // This will cascade to delete associated checklist items due to cascade: true
        await this.checklistRepository
            .createQueryBuilder()
            .delete()
            .from(Checklist)
            .where('cardId = :cardId', { cardId: card.id })
            .execute();

        // Create new checklists and their items
        const newChecklists: Checklist[] = [];
        for (const checklistDto of checklistDtos) {
            const checklist = this.checklistRepository.create({
                title: checklistDto.title,
                card,
            });

            // Save the checklist first to get an ID
            const savedChecklist = await this.checklistRepository.save(checklist);

            // Update checklist items
            if (checklistDto.items) {
                savedChecklist.items = await this.checklistItemsService.save(savedChecklist, checklistDto.items);
            }

            newChecklists.push(savedChecklist);
        }

        // Save checklists with their items
        if (newChecklists.length > 0) {
            await this.checklistRepository.save(newChecklists);
        }

        return newChecklists;
    }
}