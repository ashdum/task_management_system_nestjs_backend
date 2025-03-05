import { Column, Entity, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
export class CardComment extends BaseEntity {
  @ApiProperty({ description: 'Text of the comment', example: 'Great job!' })
  @Column()
  text!: string;

  @ApiProperty({ description: 'User who made the comment', type: () => User })
  @ManyToOne(() => User)
  @Index('idx_comments_userId')
  user!: User;

  @ApiProperty({ description: 'Card the comment belongs to', type: () => Card })
  @ManyToOne(() => Card, (card) => card.comments)
  @Index('idx_comments_cardId')
  card!: Card;
}