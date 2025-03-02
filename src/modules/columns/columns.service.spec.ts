import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let columnRepository: Repository<ColumnEntity>;
  let dashboardRepository: Repository<Dashboard>;

  const mockDashboard = { id: 'dashboard-id', title: 'Test Dashboard' };
  const mockColumn = { id: 'column-id', title: 'Test Column', order: 1, dashboard: mockDashboard };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockColumn),
            save: jest.fn().mockResolvedValue(mockColumn),
          },
        },
        {
          provide: getRepositoryToken(Dashboard),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockDashboard),
          },
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
      order: 1,
      dashboardId: 'dashboard-id',
    };

    const result = await service.create(createColumnDto);

    expect(dashboardRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'dashboard-id' },
    });
    expect(columnRepository.create).toHaveBeenCalledWith({
      title: 'Test Column',
      order: 1,
      dashboard: mockDashboard,
    });
    expect(columnRepository.save).toHaveBeenCalledWith(mockColumn);
    expect(result).toEqual(mockColumn);
  });
});