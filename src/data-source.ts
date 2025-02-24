// src/data-source.ts
require('reflect-metadata');
import { DataSource } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import config from './config/config';
const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

module.exports = AppDataSource;
