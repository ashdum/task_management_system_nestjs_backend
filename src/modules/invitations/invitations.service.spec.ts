import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardInvitation } from './entities/invitation.entity';
import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { User } from '../users/entities/user.entity';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let invitationRepository: Repository<DashboardInvitation>;
  let dashboardRepository: Repository<Dashboard>;
  let userRepository: Repository<User>;

  const mockDashboard = { id: 'dashboard-id', title: 'Test Dashboard' };
  const mockUser = { id: 'user-id', email: 'test@example.com' };
  const mockInvitation = {
    id: 'invitation-id',
    dashboard: mockDashboard,
    inviter: mockUser,
    inviterEmail: 'test@example.com',
    inviteeEmail: 'invitee@example.com',
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: getRepositoryToken(DashboardInvitation),
          useValue: {
            create: jest.fn().mockReturnValue(mockInvitation),
            save: jest.fn().mockResolvedValue(mockInvitation),
          },
        },
        {
          provide: getRepositoryToken(Dashboard),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockDashboard),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    invitationRepository = module.get<Repository<DashboardInvitation>>(getRepositoryToken(DashboardInvitation));
    dashboardRepository = module.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create an invitation', async () => {
    const createInvitationDto = {
      dashboardId: 'dashboard-id',
      inviteeEmail: 'invitee@example.com',
      status: 'pending' as const, // Указываем как литерал типа
    };

    const result = await service.create(createInvitationDto, 'user-id', 'test@example.com');

    expect(dashboardRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'dashboard-id' },
    });
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
    expect(invitationRepository.create).toHaveBeenCalledWith({
      dashboard: mockDashboard,
      inviter: mockUser,
      inviterEmail: 'test@example.com',
      inviteeEmail: 'invitee@example.com',
      status: 'pending',
    });
    expect(invitationRepository.save).toHaveBeenCalledWith(mockInvitation);
    expect(result).toEqual(mockInvitation);
  });
});