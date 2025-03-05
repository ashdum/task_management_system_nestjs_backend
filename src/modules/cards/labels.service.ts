import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from './entities/label.entity';
import { Card } from './entities/card.entity';
import { LabelDto } from './dto/update-card.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async findAllByCardId(cardId: string): Promise<Label[]> {
    return this.labelRepository.find({
      where: { card: { id: cardId } },
    });
  }

  async save(card: Card, labelDtos: LabelDto[]): Promise<Label[]> {
    // Delete all existing labels for the card using a single DELETE query
    await this.labelRepository
      .createQueryBuilder()
      .delete()
      .from(Label)
      .where('cardId = :cardId', { cardId: card.id })
      .execute();

    // Create new labels
    const newLabels = labelDtos.map((labelDto) =>
      this.labelRepository.create({
        text: labelDto.text,
        color: labelDto.color,
        card,
      }),
    );

    // Save the new labels
    if (newLabels.length > 0) {
      await this.labelRepository.save(newLabels);
    }

    return newLabels;
  }
}