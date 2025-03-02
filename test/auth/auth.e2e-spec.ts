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

describe('AuthController (e2e)', () => {
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
      providers: [RedisUtil],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    dashboardUserRepository = moduleFixture.get<Repository<DashboardUser>>(getRepositoryToken(DashboardUser));
    invitationRepository = moduleFixture.get<Repository<DashboardInvitation>>(getRepositoryToken(DashboardInvitation));
    redisUtil = moduleFixture.get<RedisUtil>(RedisUtil);

    // Очистка таблиц в правильном порядке
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
    const accessTtl = 3600;
    await redisUtil.setToken(`access_token:${userId}`, userToken, accessTtl);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register - should register a new user', async () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'NewPassword123!',
      fullName: 'New User',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe('newuser@example.com');
  });

  it('POST /auth/login - should login a user', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe('test@example.com');
    userToken = response.body.accessToken; // Обновляем токен для следующих тестов
    await redisUtil.setToken(`access_token:${userId}`, userToken, 3600);
  });

  it('POST /auth/logout - should logout a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.message).toBe('Выход успешен');

    const tokenExists = await redisUtil.tokenExists(`access_token:${userId}`);
    expect(tokenExists).toBe(false);
  });

  it('POST /auth/change-password - should change user password', async () => {
    // Обновляем токен после logout, так как предыдущий стал недействительным
    const loginDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);
    userToken = loginResponse.body.accessToken;
    await redisUtil.setToken(`access_token:${userId}`, userToken, 3600);

    const changePasswordDto = {
      userId,
      oldPassword: 'TestPassword123!',
      newPassword: 'NewPassword456!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send(changePasswordDto)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.id).toBe(userId);
  });
});