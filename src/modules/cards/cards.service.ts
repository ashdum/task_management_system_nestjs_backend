import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Label } from './entities/label.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const { columnId, memberIds, labels, ...cardData } = createCardDto;

    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Колонка с ID ${columnId} не найдена`);
    }

    let members: User[] = [];
    if (memberIds && memberIds.length > 0) {
      members = await this.userRepository.findByIds(memberIds);
      if (members.length !== memberIds.length) {
        throw new NotFoundException(
          'Один или несколько пользователей не найдены',
        );
      }
    }

    const card = this.cardRepository.create({
      ...cardData,
      column, // Возвращаем свойство column
      members,
      labels: labels
        ? labels.map((label) => this.labelRepository.create(label))
        : [],
    });

    return this.cardRepository.save(card);
  }

  async findAllByColumn(columnId: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { column: { id: columnId } },
      relations: [
        'members',
        'labels',
        'checklists',
        'checklists.items',
        'comments',
        'attachments',
      ],
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: [
        'members',
        'labels',
        'checklists',
        'checklists.items',
        'comments',
        'attachments',
        'column',
      ],
    });
    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }
    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.findOne(id);

    const { columnId, memberIds, labels, ...cardData } = updateCardDto;

    if (columnId) {
      const column = await this.columnRepository.findOne({
        where: { id: columnId },
      });
      if (!column) {
        throw new NotFoundException(`Колонка с ID ${columnId} не найдена`);
      }
      card.column = column; // Возвращаем свойство column
    }

    if (memberIds) {
      const members = await this.userRepository.findByIds(memberIds);
      if (members.length !== memberIds.length) {
        throw new NotFoundException(
          'Один или несколько пользователей не найдены',
        );
      }
      card.members = members;
    }

    if (labels) {
      card.labels = labels.map((label) => this.labelRepository.create(label));
    }

    Object.assign(card, cardData);
    return this.cardRepository.save(card);
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);
    await this.cardRepository.remove(card);
  }
}
