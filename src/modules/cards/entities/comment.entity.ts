// src/modules/cards/entities/comment.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @ApiProperty({ description: 'Text of the comment', example: 'Great job!' })
  @Column()
  text!: string;

  @ApiProperty({ description: 'ID of the user who commented', example: 'user-id' })
  @Column({ type: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Email of the user who commented', example: 'user@example.com' })
  @Column()
  userEmail!: string;

  @ApiProperty({ description: 'Card the comment belongs to', type: () => Card })
  @ManyToOne(() => Card, (card) => card.comments)
  card!: Card;

  @ApiProperty({ description: 'User who made the comment', type: () => User })
  @ManyToOne(() => User)
  user!: User;
}