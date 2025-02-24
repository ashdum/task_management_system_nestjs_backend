// src/modules/columns/entities/column.entity.ts
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Dashboard } from '../../dashboards/entities/dashboard.entity';
import { Card } from 'src/modules/cards/entities/card.entity';

@Entity('columns')
export class ColumnEntity extends BaseEntity {
  @ApiProperty({ description: 'Title of the column', example: 'To Do' })
  @Column()
  title!: string;

  @ApiProperty({ description: 'Order of the column', example: 1 })
  @Column({ type: 'integer' })
  order!: number;

  @ApiProperty({ description: 'Cards in the column', type: () => [Card] })
  @OneToMany(() => Card, (card) => card.column)
  cards!: Card[];

  @ApiProperty({
    description: 'Is the column archived?',
    example: false,
    required: false,
  })
  @Column({ default: false })
  is_archive?: boolean;

  @ApiProperty({
    description: 'Dashboard the column belongs to',
    type: () => Dashboard,
  })
  @ManyToOne(() => Dashboard, (dashboard) => dashboard.columns)
  dashboard!: Dashboard;
}
