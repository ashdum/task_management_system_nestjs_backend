import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Label } from './entities/label.entity';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepository: Repository<Card>;
  let columnRepository: Repository<ColumnEntity>;

  const mockColumn = { id: 'column-id', title: 'Test Column' };
  const mockCard = { id: 'card-id', title: 'Test Card', number: 1, column: mockColumn };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useValue: {
            create: jest.fn().mockReturnValue(mockCard),
            save: jest.fn().mockResolvedValue(mockCard),
          },
        },
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockColumn),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findByIds: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Label),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    columnRepository = module.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
  });

  it('should create a card', async () => {
    const createCardDto = {
      number: 1,
      title: 'Test Card',
      columnId: 'column-id',
    };

    const result = await service.create(createCardDto);

    expect(columnRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'column-id' },
    });
    expect(cardRepository.create).toHaveBeenCalledWith({
      number: 1,
      title: 'Test Card',
      column: mockColumn,
      members: [],
      labels: [],
    });
    expect(cardRepository.save).toHaveBeenCalledWith(mockCard);
    expect(result).toEqual(mockCard);
  });
});