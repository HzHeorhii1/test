# SpheraX

NestJS microservices monorepo with REST + gRPC, API versioning, and DDD architecture.

---

## Architecture

Two independent microservices share three libraries:

| Service  | REST  | gRPC  | Responsibility                         |
| -------- | ----- | ----- | -------------------------------------- |
| `iam`    | :3001 | :5001 | Authentication, user management        |
| `notify` | :3002 | :5002 | Notifications, email/SMS/push delivery |

| Library       | Purpose                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `libs/common` | Logger, exception filters, API versioning middleware, DDD base classes     |
| `libs/proto`  | `.proto` files, generated types, gRPC client factory, proto↔domain mappers |
| `libs/auth`   | JWT strategy, Passport guards, decorators, Token value object              |

Each service follows strict DDD layering (Presentation → Application → Domain → Infrastructure) with CQRS (`@nestjs/cqrs`). The domain layer is pure TypeScript — zero framework imports.

`notify` calls `iam` via gRPC to resolve user details before persisting a notification.

---

## Monorepo layout

```
libs/
  common/   # shared DDD bases, versioning, logger, filters
  proto/    # .proto files, generated types, gRPC factory, mappers
  auth/     # JWT strategy, guards, decorators

services/
  iam/      # REST :3001 / gRPC :5001
  notify/   # REST :3002 / gRPC :5002
```

---

## Prerequisites

- Node.js 20 LTS
- npm 9+
- PostgreSQL (or Docker)
- `protoc` + `protoc-gen-ts_proto` (installed automatically via npm in Docker)

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL_IAM, DATABASE_URL_NOTIFY, IAM_JWT_SECRET
```

### 3. Generate proto TypeScript types

```bash
npm run proto:gen
```

### 4. Generate Prisma clients and run migrations

```bash
npm run generate:all
npm run migrate:all
```

### 5. Start services (separate terminals)

```bash
npm run start:dev:iam
npm run start:dev:notify
```

### Swagger UI

- IAM: http://localhost:3001/api/docs
- Notify: http://localhost:3002/api/docs

---

## Docker (single Dockerfile)

The repo ships one `Dockerfile` per environment. The service is selected via the `SERVICE_NAME` build argument.

### Build

```bash
docker build -f docker/prod/Dockerfile --build-arg SERVICE_NAME=iam -t spherax-iam .
docker build -f docker/prod/Dockerfile --build-arg SERVICE_NAME=notify -t spherax-notify .
```

### Run

```bash
docker run -p 3001:3001 -p 5001:5001 --env-file .env spherax-iam
docker run -p 3002:3002 -p 5002:5002 --env-file .env spherax-notify
```

### Docker Compose (recommended)

```bash
docker-compose up          # development (hot-reload)
docker-compose -f docker-compose.prod.yml up   # production
```

---

## API versioning

Every REST endpoint reads the `X-SpheraX-Api-Version` header via `ApiVersionMiddleware` (in `libs/common`). Omitting the header defaults to version 1.

| Version | Response shape                                                                         |
| ------- | -------------------------------------------------------------------------------------- |
| 1       | Basic fields only                                                                      |
| 2       | Extended — adds `roles`, `createdAt` (users) or `message`, `createdAt` (notifications) |

### Examples

```bash
# Register — v1 response: { id, email }
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-SpheraX-Api-Version: 1" \
  -d '{"email":"user@example.com","password":"Secret123"}'

# Register — v2 response: { id, email, roles, createdAt }
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-SpheraX-Api-Version: 2" \
  -d '{"email":"user2@example.com","password":"Secret123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123"}'

# Get user — v2
curl http://localhost:3001/api/users/<id> \
  -H "X-SpheraX-Api-Version: 2"
```

---

## gRPC service-to-service call

`notify` resolves the user from `iam` via gRPC before persisting a notification. Sending a notification triggers this internal call automatically.

```bash
# Send notification (notify → iam gRPC internally)
curl -X POST http://localhost:3002/api/notifications \
  -H "Content-Type: application/json" \
  -H "X-SpheraX-Api-Version: 1" \
  -d '{"userId":"<user-id>","channel":"EMAIL","message":"Welcome!"}'

# List notifications — v2 (includes message + createdAt)
curl "http://localhost:3002/api/notifications?userId=<user-id>" \
  -H "X-SpheraX-Api-Version: 2"
```

---

## Shared code — three levels

| Level       | Location                                                         | Examples                                                                                                                                            |
| ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Global**  | `libs/common`, `libs/proto`, `libs/auth`                         | `ApiVersionMiddleware`, `AggregateRootBase`, `createGrpcClient`, `UserProtoMapper`, `AuthGuard`                                                     |
| **Service** | `services/*/src/application/validators/`, `application/mappers/` | `EmailUniqueValidator`, `UserExistsValidator`, `UserApplicationMapper` (iam); `ChannelSupportedValidator`, `NotificationApplicationMapper` (notify) |
| **API**     | `libs/proto/src/mappers/`                                        | `UserProtoMapper.toGetUserResponse()` — used by both REST and gRPC handlers of the same resource                                                    |

---

## Testing

```bash
npm test                                   # all unit tests
npm run test:e2e                           # e2e tests (requires DB)
npm run test:cov                           # coverage report
```

Unit tests cover:

- `ApiVersionMiddleware` — header parsing, default version, fallback
- `VersionedResponseMapper` — v1 vs v2 response shape, unknown version fallback

E2e tests cover:

- `POST /api/auth/register` — 201, v1 shape (no header), v2 shape (header present)
- `GET /api/users/:id` — 404 unknown, v1/v2 shapes for known user
- `POST /api/notifications` — 201, v1/v2 shapes, IAM gRPC client mocked
