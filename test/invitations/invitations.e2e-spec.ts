import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Dashboard } from '../../src/modules/dashboards/entities/dashboard.entity';
import { DashboardUser } from '../../src/modules/dashboards/entities/dashboard-user.entity';
import { DashboardInvitation } from '../../src/modules/invitations/entities/invitation.entity';
import { ColumnEntity } from '../../src/modules/columns/entities/column.entity';
import { Card } from '../../src/modules/cards/entities/card.entity'; // Добавляем Card
import { RedisUtil } from '../../src/common/utils/redis.util';
import * as bcrypt from 'bcrypt';
import { ConfigModule } from '@nestjs/config';

describe('InvitationsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let dashboardRepository: Repository<Dashboard>;
  let dashboardUserRepository: Repository<DashboardUser>;
  let invitationRepository: Repository<DashboardInvitation>;
  let columnRepository: Repository<ColumnEntity>;
  let cardRepository: Repository<Card>; // Добавляем репозиторий Card
  let redisUtil: RedisUtil;
  let userToken: string;
  let userId: string;
  let dashboardId: string;

  beforeAll(async () => {
    process.env.POSTGRES_DB = 'task_management_db_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          ignoreEnvFile: false,
        }),
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5435', 10),
          username: process.env.POSTGRES_USER || 'your_postgres_user',
          password: process.env.POSTGRES_PASSWORD || 'mysecretpassword123',
          database: process.env.POSTGRES_DB || 'task_management_db_test',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User, Dashboard, DashboardUser, DashboardInvitation, ColumnEntity, Card]), // Добавляем Card
      ],
      providers: [RedisUtil],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    dashboardRepository = moduleFixture.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));
    dashboardUserRepository = moduleFixture.get<Repository<DashboardUser>>(getRepositoryToken(DashboardUser));
    invitationRepository = moduleFixture.get<Repository<DashboardInvitation>>(getRepositoryToken(DashboardInvitation));
    columnRepository = moduleFixture.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
    cardRepository = moduleFixture.get<Repository<Card>>(getRepositoryToken(Card)); // Инициализируем репозиторий Card
    redisUtil = moduleFixture.get<RedisUtil>(RedisUtil);

    // Очистка таблиц в правильном порядке
    await cardRepository.delete({}); // Сначала очищаем cards
    await columnRepository.delete({});
    await invitationRepository.delete({});
    await dashboardUserRepository.delete({});
    await dashboardRepository.delete({});
    await userRepository.delete({});

    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const testUser = userRepository.create({
      email: 'test@example.com',
      password: hashedPassword,
      fullName: 'Test User',
    });
    const savedUser = await userRepository.save(testUser);
    userId = savedUser.id;

    const payload = { sub: userId, email: 'test@example.com' };
    userToken = jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'your-very-secret-key-for-access-token',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    });
    const accessTtl = 3600;
    await redisUtil.setToken(`access_token:${userId}`, userToken, accessTtl);

    const dashboard = dashboardRepository.create({
      title: 'Test Dashboard',
      ownerIds: [userId],
    });
    const savedDashboard = await dashboardRepository.save(dashboard);
    dashboardId = savedDashboard.id;

    const dashboardUser = dashboardUserRepository.create({
      user: savedUser,
      dashboard: savedDashboard,
      role: 'admin',
    });
    await dashboardUserRepository.save(dashboardUser);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /invitations - should create an invitation', async () => {
    const createInvitationDto = {
      dashboardId,
      inviteeEmail: 'invitee@example.com',
      status: 'pending',
    };

    const response = await request(app.getHttpServer())
      .post('/invitations')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createInvitationDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.inviteeEmail).toBe('invitee@example.com');
    expect(response.body.status).toBe('pending');
  });
});