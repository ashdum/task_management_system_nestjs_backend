import { Test, TestingModule } from '@nestjs/testing';
import { DashboardsService } from './dashboards.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { DashboardUser } from './entities/dashboard-user.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let dashboardRepository: Repository<Dashboard>;
  let dashboardUserRepository: Repository<DashboardUser>;
  let userRepository: Repository<User>;

  const mockDashboard = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Dashboard',
    ownerIds: ['user-id-1'],
    columns: [],
    invitations: [],
    dashboardUsers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        {
          provide: getRepositoryToken(Dashboard),
          useValue: {
            create: jest.fn().mockReturnValue(mockDashboard),
            save: jest.fn().mockResolvedValue(mockDashboard),
            findOneOrFail: jest.fn().mockResolvedValue(mockDashboard),
            find: jest.fn().mockResolvedValue([mockDashboard]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(DashboardUser),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue([{ dashboard: mockDashboard }]),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
    dashboardRepository = module.get<Repository<Dashboard>>(
      getRepositoryToken(Dashboard),
    );
    dashboardUserRepository = module.get<Repository<DashboardUser>>(
      getRepositoryToken(DashboardUser),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const createDashboardDto = {
        title: 'Test Dashboard',
        ownerIds: ['user-id-1'],
      };
      const result = await service.create(createDashboardDto, 'user-id-1');

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(dashboardRepository.create).toHaveBeenCalledWith({
        ...createDashboardDto,
        columns: [],
        invitations: [],
      });
      expect(dashboardRepository.save).toHaveBeenCalled();
      expect(dashboardUserRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        dashboard: mockDashboard,
        role: 'admin',
      });
      expect(dashboardUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new Error());

      await expect(
        service.create({ title: 'Test', ownerIds: ['user-id-1'] }, 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return dashboards for a user', async () => {
      const result = await service.findAll('user-id-1');

      expect(dashboardUserRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-id-1' } },
        relations: ['dashboard'],
      });
      expect(dashboardRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) },
        relations: expect.any(Array),
      });
      expect(result).toEqual([mockDashboard]);
    });

    it('should return empty array if no dashboards found', async () => {
      jest.spyOn(dashboardUserRepository, 'find').mockResolvedValue([]);
      const result = await service.findAll('user-id-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id', async () => {
      const result = await service.findOne(mockDashboard.id);

      expect(dashboardRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockDashboard.id },
        relations: expect.any(Array),
      });
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      jest
        .spyOn(dashboardRepository, 'findOneOrFail')
        .mockRejectedValue(new Error());

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      const updateDashboardDto = { title: 'Updated Dashboard' };
      const updatedDashboard = { ...mockDashboard, ...updateDashboardDto };

      jest
        .spyOn(dashboardRepository, 'save')
        .mockResolvedValue(updatedDashboard);

      const result = await service.update(mockDashboard.id, updateDashboardDto);

      expect(dashboardRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockDashboard.id },
        relations: expect.any(Array),
      });
      expect(dashboardRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockDashboard.id,
          title: 'Updated Dashboard',
          ownerIds: ['user-id-1'],
          columns: [],
          invitations: [],
          dashboardUsers: [],
        }),
      );
      expect(result).toMatchObject({
        id: mockDashboard.id,
        title: 'Updated Dashboard',
        ownerIds: ['user-id-1'],
        columns: [],
        invitations: [],
        dashboardUsers: [],
      });
    });
  });

  describe('remove', () => {
    it('should remove a dashboard', async () => {
      await service.remove(mockDashboard.id);

      expect(dashboardRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockDashboard.id },
        relations: expect.any(Array),
      });
      expect(dashboardUserRepository.delete).toHaveBeenCalledWith({
        dashboard: { id: mockDashboard.id },
      });
      expect(dashboardRepository.remove).toHaveBeenCalledWith(mockDashboard);
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      jest
        .spyOn(dashboardRepository, 'findOneOrFail')
        .mockRejectedValue(new Error());

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});