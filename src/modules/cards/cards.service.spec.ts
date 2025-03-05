import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { ColumnEntity } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Label } from './entities/label.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepository: Repository<Card>;
  let columnRepository: Repository<ColumnEntity>;
  let dashboardRepository: Repository<Dashboard>;

  const mockDashboard = { id: 'dashboard-id', title: 'Test Dashboard' };
  const mockColumn = { id: 'column-id', title: 'Test Column', dashboard: mockDashboard };
  const mockCard = { id: 'card-id', title: 'Test Card', number: 1, column: mockColumn };

  // Define mock repository methods with proper types
  const mockCardRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockColumnRepository = {
    findOne: jest.fn(),
  };

  const mockDashboardRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
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
        {
          provide: getRepositoryToken(Dashboard),
          useValue: mockDashboardRepository,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    columnRepository = module.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
    dashboardRepository = module.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));
  });

  it('should create a card', async () => {
    const createCardDto = {
      title: 'Test Card',
      columnId: 'column-id',
      dashboardId: 'dashboard-id',
    };

    mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
    mockColumnRepository.findOne.mockResolvedValue(mockColumn);
    mockCardRepository.find.mockResolvedValue([]); // No existing cards, so number starts at 1
    mockCardRepository.create.mockReturnValue(mockCard);
    mockCardRepository.save.mockResolvedValue(mockCard);

    const result = await service.create(createCardDto);

    expect(dashboardRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'dashboard-id' },
    });
    expect(columnRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'column-id' },
    });
    expect(cardRepository.find).toHaveBeenCalledWith({
      where: { column: { dashboard: { id: 'dashboard-id' } } },
      order: { number: 'DESC' },
      take: 1,
    });
    expect(cardRepository.create).toHaveBeenCalledWith({
      title: 'Test Card',
      number: 1, // Auto-incremented
      column: mockColumn,
      members: [],
      labels: [],
    });
    expect(cardRepository.save).toHaveBeenCalledWith(mockCard);
    expect(result).toEqual(mockCard);
  });
});