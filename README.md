# Smart Task Manager

A production-ready full-stack SaaS task management application built with Spring Boot + MongoDB + Redis and Next.js 14.

## Tech Stack

**Backend:** Java 17, Spring Boot 3.2.3, MongoDB, Upstash Redis, JWT Auth, Cloudinary, JavaMail, Swagger UI  
**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit + RTK Query, React Hook Form + Zod

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB Atlas account
- Upstash Redis account
- Cloudinary account
- Gmail account with App Password

## Setup

### 1. Clone / enter the project

```bash
cd smart-task-manager
```

### 2. Fill in backend environment variables

Open `backend/.env` and fill in all values:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskmanager
UPSTASH_REDIS_URL=rediss://default:password@host.upstash.io:6379
UPSTASH_REDIS_SSL=true
JWT_SECRET=<run: openssl rand -hex 32>
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
```

### 3. Fill in frontend environment variables

Open `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs | http://localhost:8080/api-docs |

## API Overview

| Group | Base Path |
|-------|-----------|
| Auth | `/api/v1/auth` |
| Tasks | `/api/v1/tasks` |
| Users | `/api/v1/users` |
| Activity | `/api/v1/activity` |

## Screenshots

_Add screenshots here after first run._

## Features

- JWT authentication with access + refresh tokens
- Token blacklisting via Redis on logout
- Task CRUD with priority, status, due dates, attachments
- File uploads to Cloudinary
- Automated email reminders (hourly scheduler)
- Welcome email on registration
- Redis caching for tasks (10-minute TTL)
- Activity log for every task mutation
- Role-based access control (USER / ADMIN)
- Paginated, filterable task list
- Full Swagger UI documentation
