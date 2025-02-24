// src/modules/cards/entities/card.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { User } from '../../users/entities/user.entity';
import { Label } from './label.entity';
import { Checklist } from './checklist.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';

@Entity('cards')
export class Card extends BaseEntity {
  @ApiProperty({ description: 'Card number', example: 1 })
  @Column({ type: 'integer' })
  number!: number;

  @ApiProperty({ description: 'Title of the card', example: 'Task 1' })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Description of the card',
    example: 'Do this task',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'ID of the column', example: 'column-id' })
  @Column({ type: 'uuid' })
  columnId!: string;

  @ApiProperty({
    description: 'Members assigned to the card',
    type: () => [User],
  })
  @ManyToMany(() => User, (user) => user.cards)
  @JoinTable()
  members!: User[];

  @ApiProperty({ description: 'Labels on the card', type: () => [Label] })
  @OneToMany(() => Label, (label) => label.card)
  labels!: Label[];

  @ApiProperty({
    description: 'Checklists on the card',
    type: () => [Checklist],
  })
  @OneToMany(() => Checklist, (checklist) => checklist.card)
  checklists!: Checklist[];

  @ApiProperty({ description: 'Comments on the card', type: () => [Comment] })
  @OneToMany(() => Comment, (comment) => comment.card)
  comments!: Comment[];

  @ApiProperty({
    description: 'Image URLs',
    example: ['https://example.com/img1.jpg'],
    required: false,
  })
  @Column('simple-array', { nullable: true })
  images?: string[];

  @ApiProperty({
    description: 'Attachments on the card',
    type: () => [Attachment],
  })
  @OneToMany(() => Attachment, (attachment) => attachment.card)
  attachments!: Attachment[];

  @ApiProperty({
    description: 'Due date of the card',
    example: '2025-03-01',
    required: false,
  })
  @Column({ nullable: true })
  dueDate?: string;

  @ApiProperty({
    description: 'Column the card belongs to',
    type: () => ColumnEntity,
  })
  @ManyToOne(() => ColumnEntity, (column) => column.cards)
  column!: ColumnEntity;
}
