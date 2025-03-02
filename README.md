# 🌟 Task Management System - NestJS Backend

Welcome to the **Task Management System** — a powerful, sleek, and modern backend built with **NestJS** that turns chaos into order! Whether you're juggling projects, organizing teams, or just keeping track of your daily to-dos, this backend has got your back with a robust API, secure authentication, and a sprinkle of magic ✨. Powered by TypeORM, Redis, and Docker, it’s ready to scale with your wildest ambitions!

---

## 🚀 What’s This All About?

Imagine a world where tasks flow effortlessly across dashboards, columns, and cards — all while you sip your coffee and watch productivity soar. That’s what this backend delivers! It’s a fully-featured RESTful API for managing:

- **Dashboards**: Your project hubs.
- **Columns**: Organize tasks like a pro.
- **Cards**: The heartbeat of every task, with checklists, labels, and attachments.
- **Invitations**: Collaborate with your team seamlessly.
- **Users & Auth**: Secure login, registration, and OAuth (Google, GitHub) support.

Built with **NestJS**, it’s modular, testable, and efficient! Perfect for startups, teams, or anyone who loves a good Kanban board.

---

## 🌈 Features That Make You Smile

- **Secure Authentication**: JWT-based login, refresh tokens, OAuth (Google & GitHub), and password changes.
- **Task Management**: Create, update, and delete dashboards, columns, and cards with ease.
- **Collaboration**: Invite teammates with a simple API call.
- **Scalability**: Redis for token storage and PostgreSQL for data, all containerized with Docker.
- **Tested to Perfection**: Full suite of E2E and unit tests.
- **Swagger Docs**: Interactive API documentation at `/api`.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18+
- **Docker**: For PostgreSQL, Redis, and Nginx.
- **npm**: Package manager.

### Installation

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/ashdum/task_management_system_nestjs_backend.git
   cd task_management_system_nest_backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up Environment**:
   ```bash
   cp .env.example .env
   ```
   Fill in your secrets in `.env`.
4. **Launch with Docker**:
   ```bash
   docker-compose up -d
   ```
5. **Run the App**:
   ```bash
   npm run start:dev
   ```
   Open [http://localhost:3000/api](http://localhost:3000/api) for Swagger UI.

---

## 🎮 Usage

### Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "Password123!", "fullName": "Task Master"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "Password123!"}'
```

### Create a Dashboard
```bash
curl -X POST http://localhost:3000/dashboards \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{"title": "My Awesome Project", "ownerIds": ["user-id"]}'
```

For the full list of endpoints, check out the Swagger docs at `/api`.

---

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
docker-compose up -d
npm run test:e2e
```

---

## 📂 Project Structure

Here’s how we keep everything neat and tidy:

```
task_management_system_nest_backend/
├── .docker/                # Docker configs (Dockerfile, Nginx setup)
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose setup for services
├── src/                    # Source code 🎯
│   ├── common/             # Shared utilities (guards, decorators, Redis utils)
│   ├── config/             # Configuration files (DB, Redis, etc.)
│   ├── database/           # Migrations and seeds for DB setup
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication APIs (login, OAuth, etc.)
│   │   ├── cards/          # Task cards with checklists, labels, and more
│   │   ├── columns/        # Task columns for organization
│   │   ├── dashboards/     # Dashboard management
│   │   ├── invitations/    # Team collaboration invites
│   │   └── users/          # User management APIs
│   ├── app.*               # Root app files (controller, service, etc.)
│   └── main.ts             # Entry point to start the app
├── test/                   # Test suites 🧪
├── package.json            # Dependencies and scripts
└── README.md               # You’re reading it! 📚
```

---

## 🐳 Docker Magic

We use Docker for easy deployment:

- **PostgreSQL**: Stores tasks and users.
- **Redis**: Manages session tokens.
- **Nginx**: Reverse proxy for the API.

Run everything with:
```bash
docker-compose up -d
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repo.
2. Create a branch (`git checkout -b feature/cool-idea`).
3. Commit your changes (`git commit -m "Added a new feature"`).
4. Push to your branch (`git push origin feature/cool-idea`).
5. Open a Pull Request.

---

## 🌟 Why You’ll Love It

- **Cute & Powerful**: A backend that’s as fun to use as it is robust.
- **Team-Friendly**: Invite your crew and conquer tasks together.
- **Developer Joy**: Clean code, full tests, and Swagger docs — what’s not to love?

---

## 🧀 Technologies & Libraries

- **NestJS**: Modular and scalable framework.
- **TypeORM**: Seamless database interactions with PostgreSQL.
- **Redis**: Lightning-fast session management.
- **JWT**: Secure authentication tokens.
- **OAuth**: Google and GitHub login support.
- **Docker**: Containerized PostgreSQL, Redis, and Nginx.
- **Swagger**: API documentation.
- **TypeScript**: Type-safe, reliable coding.
- **Jest**: Unit and E2E testing.

---

## 👨‍💻 About the Creator

**Ashot Dumikyan** — Team Lead & System Architect.

- **Contact**: ashotdumikyan@gmail.com | +37477556021
- **Experience**: 8+ years in PHP, Node.js, TypeScript.
- **Expertise**: Databases, microservices, smart city solutions.

Happy coding! ✨

