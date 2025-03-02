import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { DashboardUser } from '../../src/modules/dashboards/entities/dashboard-user.entity';
import { DashboardInvitation } from '../../src/modules/invitations/entities/invitation.entity';
import { RedisUtil } from '../../src/common/utils/redis.util';
import * as bcrypt from 'bcrypt';
import { ConfigModule } from '@nestjs/config';

describe('DashboardsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let dashboardUserRepository: Repository<DashboardUser>;
  let invitationRepository: Repository<DashboardInvitation>;
  let redisUtil: RedisUtil;
  let userToken: string;
  let userId: string;

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
        TypeOrmModule.forFeature([User, DashboardUser, DashboardInvitation]),
      ],
      providers: [RedisUtil], // Добавляем RedisUtil как провайдер
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
    console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
    console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    dashboardUserRepository = moduleFixture.get<Repository<DashboardUser>>(
      getRepositoryToken(DashboardUser),
    );
    invitationRepository = moduleFixture.get<Repository<DashboardInvitation>>(
      getRepositoryToken(DashboardInvitation),
    );
    redisUtil = moduleFixture.get<RedisUtil>(RedisUtil);

    await invitationRepository.delete({});
    await dashboardUserRepository.delete({});
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

    // Сохраняем токен в Redis, как в реальном приложении
    const accessTtl = 3600; // 1 час в секундах
    await redisUtil.setToken(`access_token:${userId}`, userToken, accessTtl);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /dashboards - should create a dashboard', async () => {
    const createDashboardDto = {
      title: 'Test Dashboard',
      ownerIds: [userId],
    };

    const response = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createDashboardDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Dashboard');
    expect(response.body.ownerIds).toContain(userId);
  });

  it('GET /dashboards - should return dashboards for the user', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', 'Test Dashboard');
  });

  it('DELETE /dashboards/:id - should delete a dashboard', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Dashboard to Delete', ownerIds: [userId] })
      .expect(201);

    const dashboardId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/dashboards/${dashboardId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/dashboards/${dashboardId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('POST /dashboards - should fail without token', async () => {
    const createDashboardDto = {
      title: 'Unauthorized Dashboard',
      ownerIds: [userId],
    };

    await request(app.getHttpServer())
      .post('/dashboards')
      .send(createDashboardDto)
      .expect(401);
  });
});