import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5435', 10),
  username: process.env.POSTGRES_USER || 'your_postgres_user',
  password: process.env.POSTGRES_PASSWORD || 'mysecretpassword123',
  database: process.env.POSTGRES_DB || 'task_management_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // В продакшене установите false
};