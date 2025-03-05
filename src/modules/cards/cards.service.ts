import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { LabelsService } from './labels.service';
import { ChecklistsService } from './checklists.service';
import { CommentsService } from './comments.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    private readonly labelsService: LabelsService,
    private readonly checklistsService: ChecklistsService,
    private readonly commentsService: CommentsService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const { dashboardId, columnId, memberIds, labels, ...cardData } = createCardDto;

    // Validate the dashboard
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }

    // Validate the column
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    // Calculate the next card number for the dashboard
    const existingCards = await this.cardRepository.find({
      where: { column: { dashboard: { id: dashboardId } } },
      order: { number: 'DESC' },
      take: 1,
    });
    const nextNumber = existingCards.length > 0 ? existingCards[0].number + 1 : 1;

    // Validate members if provided
    let members: User[] = [];
    if (memberIds && memberIds.length > 0) {
      members = await this.userRepository.findByIds(memberIds);
      if (members.length !== memberIds.length) {
        throw new NotFoundException('One or more users not found');
      }
    }

    const card = this.cardRepository.create({
      ...cardData,
      number: nextNumber,
      column,
      members,
    });

    const savedCard = await this.cardRepository.save(card);

    // Save labels if provided
    if (labels && labels.length > 0) {
      await this.labelsService.save(savedCard, labels);
    }

    return savedCard;
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
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.findOne(id);

    // Process allowed scalar fields
    const { columnId, labels, title, description, dueDate, images, checklists, comments } = updateCardDto;

    if (columnId) {
      const column = await this.columnRepository.findOne({
        where: { id: columnId },
      });
      if (!column) {
        throw new NotFoundException(`Column with ID ${columnId} not found`);
      }
      card.column = column;
    }

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (images !== undefined) card.images = images;

    // Save the card to ensure it has an ID
    await this.cardRepository.save(card);

    // Update related entities using their respective services
    if (labels !== undefined) {
      card.labels = await this.labelsService.save(card, labels);
    }

    if (checklists !== undefined) {
      card.checklists = await this.checklistsService.save(card, checklists);
    }

    if (comments !== undefined) {
      card.comments = await this.commentsService.save(card, comments);
    }

    // Save the updated card with all related entities
    return this.cardRepository.save(card);
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);
    await this.cardRepository.remove(card);
  }
}