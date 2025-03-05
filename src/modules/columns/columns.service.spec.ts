import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { DeepPartial } from 'typeorm';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let columnRepository: Repository<ColumnEntity>;
  let dashboardRepository: Repository<Dashboard>;

  const mockDashboard = { id: 'dashboard-id', title: 'Test Dashboard' };
  const mockColumn = {
    id: 'column-id',
    title: 'Test Column',
    order: 1,
    is_archive: false,
    dashboard: mockDashboard,
  };

  // Define mock repository methods with proper types
  const mockColumnRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDashboardRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
        },
        {
          provide: getRepositoryToken(Dashboard),
          useValue: mockDashboardRepository,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    columnRepository = module.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
    dashboardRepository = module.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));
  });

  it('should create a column', async () => {
    const createColumnDto = {
      title: 'Test Column',
      dashboardId: 'dashboard-id',
    };

    mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
    mockColumnRepository.count.mockResolvedValue(0);
    mockColumnRepository.create.mockReturnValue(mockColumn);
    mockColumnRepository.save.mockResolvedValue(mockColumn);

    const result = await service.create(createColumnDto);

    expect(dashboardRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'dashboard-id' },
    });
    expect(columnRepository.count).toHaveBeenCalledWith({
      where: { dashboard: { id: 'dashboard-id' } },
    });
    expect(columnRepository.create).toHaveBeenCalledWith({
      title: 'Test Column',
      order: 1, // 0 existing columns + 1
      dashboard: mockDashboard,
    });
    expect(columnRepository.save).toHaveBeenCalledWith(mockColumn);
    expect(result).toEqual(mockColumn);
  });

  it('should update the order of columns', async () => {
    const mockColumns = [
      { id: 'col1', title: 'Column 1', order: 1, dashboard: mockDashboard },
      { id: 'col2', title: 'Column 2', order: 2, dashboard: mockDashboard },
    ];
    const updateOrderDto = {
      dashboardId: 'dashboard-id',
      columnIds: ['col2', 'col1'], // Reverse the order
    };

    mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
    mockColumnRepository.find.mockResolvedValue(mockColumns);
    mockColumnRepository.save.mockImplementation(columns => Promise.resolve(columns));

    const result = await service.updateOrder(updateOrderDto);

    expect(dashboardRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'dashboard-id' },
    });
    expect(columnRepository.find).toHaveBeenCalledWith({
      where: { dashboard: { id: 'dashboard-id' } },
    });
    expect(columnRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'col2', order: 1 }),
      expect.objectContaining({ id: 'col1', order: 2 }),
    ]);
    expect(result).toHaveLength(2);
  });
});