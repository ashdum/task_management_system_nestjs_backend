task_management_system/
├── src/
│   ├── modules/                      # Модули приложения (основные бизнес-сущности)
│   │   ├── auth/                     # Модуль авторизации
│   │   │   ├── dto/                  # DTO (Data Transfer Objects) для валидации
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── strategies/           # Стратегии Passport (например, JWT)
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── auth.controller.ts    # Контроллеры (HTTP endpoints)
│   │   │   ├── auth.service.ts       # Сервисы (бизнес-логика)
│   │   │   └── auth.module.ts        # Модуль NestJS
│   │   ├── users/                    # Модуль пользователей
│   │   │   ├── dto/                  # DTO для пользователей
│   │   │   ├── entities/             # Сущности пользователей
│   │   │   │   └── user.entity.ts
│   │   │   ├── users.controller.ts   # Контроллеры
│   │   │   ├── users.service.ts      # Сервисы
│   │   │   └── users.module.ts       # Модуль
│   │   ├── dashboards/               # Модуль досок (Trello-подобные)
│   │   │   ├── dto/                  # DTO для досок
│   │   │   ├── entities/             # Сущности досок
│   │   │   ├── dashboards.controller.ts
│   │   │   ├── dashboards.service.ts
│   │   │   └── dashboards.module.ts
│   │   ├── columns/                  # Модуль колонок
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── columns.controller.ts
│   │   │   ├── columns.service.ts
│   │   │   └── columns.module.ts
│   │   ├── cards/                    # Модуль карточек
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── cards.controller.ts
│   │   │   ├── cards.service.ts
│   │   │   └── cards.module.ts
│   │   └── invitations/              # Модуль приглашений на доски
│   │       ├── dto/
│   │       ├── entities/
│   │       ├── invitations.controller.ts
│   │       ├── invitations.service.ts
│   │       └── invitations.module.ts
│   ├── common/                       # Общие утилиты, фильтры, декораторы
│   │   ├── decorators/               # Пользовательские декораторы
│   │   │   └── roles.decorator.ts
│   │   ├── filters/                  # Фильтры исключений
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                   # Guards для авторизации и ролей
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interfaces/               # Общие интерфейсы
│   │   │   └── user.interface.ts
│   │   ├── pipes/                    # Пользовательские pipes
│   │   │   └── validation.pipe.ts
│   │   └── utils/                    # Утилиты (например, хеширование паролей)
│   │       └── hash.util.ts
│   ├── config/                       # Конфигурация приложения
│   │   ├── database.config.ts        # Конфигурация PostgreSQL
│   │   ├── redis.config.ts           # Конфигурация Redis
│   │   ├── kafka.config.ts           # Конфигурация Kafka
│   │   └── jwt.config.ts             # Конфигурация JWT
│   ├── database/                     # Миграции и скрипты базы данных
│   │   ├── migrations/               # Миграции TypeORM
│   │   └── seeds/                    # Начальные данные (seeds)
│   ├── app.module.ts                 # Главный модуль приложения
│   └── main.ts                       # Точка входа приложения
├── docker/                           # Конфигурации Docker
│   ├── docker-compose.yml            # Docker Compose файл
│   └── nginx/                        # Конфигурации Nginx
│       └── default.conf              # Конфигурация Nginx
├── test/                             # Тесты
│   ├── unit/                         # Юнит-тесты
│   │   ├── auth/                     # Тесты для модуля авторизации
│   │   └── users/                    # Тесты для модуля пользователей
│   └── e2e/                          # End-to-end тесты
│       ├── auth/                     # E2E тесты для авторизации
│       └── dashboards/               # E2E тесты для досок
├── .env                              # Файл с переменными окружения
├── .gitignore                        # Игнорируемые файлы
├── package.json                      # Зависимости и скрипты
├── tsconfig.json                     # Конфигурация TypeScript
├── nest-cli.json                     # Конфигурация Nest CLI
└── README.md                         # Документация проекта