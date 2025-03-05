import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardComment } from './entities/comment.entity';
import { Card } from './entities/card.entity';
import { User } from '../users/entities/user.entity';
import { CommentDto } from './dto/update-card.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CardComment)
    private readonly commentRepository: Repository<CardComment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllByCardId(cardId: string): Promise<CardComment[]> {
    return this.commentRepository.find({
      where: { card: { id: cardId } },
      relations: ['user'],
    });
  }

  async save(card: Card, commentDtos: CommentDto[]): Promise<CardComment[]> {
    // Delete all existing comments for the card using a single DELETE query
    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .from(CardComment)
      .where('cardId = :cardId', { cardId: card.id })
      .execute();

    // Create new comments
    const newComments: CardComment[] = [];
    for (const commentDto of commentDtos) {
      if (!commentDto.userId) continue; // Skip comments without a userId

      const user = await this.userRepository.findOne({
        where: { id: commentDto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${commentDto.userId} not found`);
      }

      const comment = this.commentRepository.create({
        text: commentDto.text,
        user,
        card,
      });

      newComments.push(comment);
    }

    // Save the new comments
    if (newComments.length > 0) {
      await this.commentRepository.save(newComments);
    }

    return newComments;
  }
}