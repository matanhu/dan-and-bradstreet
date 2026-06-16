# Task Management Platform

A full-stack task management system built with NestJS, React, and PostgreSQL. Supports multiple task types (Procurement, Development) with type-specific workflow validation, extensible to new task types without modifying core logic.

## Tech Stack

- **API**: NestJS, Prisma ORM, PostgreSQL
- **Client**: React, Vite, TanStack Query, Tailwind CSS
- **Monorepo**: Nx

## Prerequisites

- Node.js 20 (see `.nvmrc` — run `nvm use` to switch automatically)
- Docker (for PostgreSQL)
- npm

## Setup

### 1. Switch to the correct Node version

```bash
nvm use
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the database

```bash
docker-compose up -d
```

### 4. Run migrations and seed demo users

```bash
cd libs/data-access && npx prisma generate && npx prisma migrate deploy && npx prisma db seed
```

This creates the database schema and seeds 3 demo users. Users are not managed through the app — they are pre-seeded and selectable when creating or reassigning tasks.

### 5. Start the API

```bash
nx serve api
```

API runs at `http://localhost:3000/api`

### 6. Start the client

```bash
nx serve client
```

Client runs at `http://localhost:4200`

## API Endpoints

| Method | Path                      | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/api/users`              | List all users                 |
| GET    | `/api/tasks/config`       | Get max status per task type   |
| GET    | `/api/tasks/user/:userId` | Get tasks assigned to a user   |
| POST   | `/api/tasks`              | Create a new task              |
| PATCH  | `/api/tasks/:id/status`   | Advance or reverse task status |
| POST   | `/api/tasks/:id/close`    | Close a task                   |

### Create Task

```json
POST /api/tasks
{ "type": "PROCUREMENT", "assignedTo": 1 }
```

### Change Status

```json
PATCH /api/tasks/:id/status
{ "toStatus": 2, "nextAssignedTo": 2, "customFields": { "priceQuotes": [100, 200] } }
```

### Get Config

```json
GET /api/tasks/config
// Response: { "PROCUREMENT": 3, "DEVELOPMENT": 4 }
```

## Workflow Rules

These rules apply to all current and future task types:

| #   | Rule                                                                                               |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | A task is assigned to exactly one user at any moment                                               |
| 2   | A task is either Open or Closed — closed tasks are immutable                                       |
| 3   | Status is tracked by ascending integers: 1, 2, 3…                                                  |
| 4   | Forward moves must be sequential (no skipping)                                                     |
| 5   | Backward moves are always allowed (no sequential restriction)                                      |
| 6   | A task may be closed only at its final status                                                      |
| 7   | Every status change must satisfy type-specific data requirements and record the next assigned user |

## Task Types

### PROCUREMENT (max status: 3)

| Status | Meaning                  | Required Data          |
| ------ | ------------------------ | ---------------------- |
| 1      | Created                  | —                      |
| 2      | Supplier offers received | 2 numeric price quotes |
| 3      | Purchase completed       | Receipt string         |
| Closed | —                        | Only from status 3     |

### DEVELOPMENT (max status: 4)

| Status | Meaning                 | Required Data                 |
| ------ | ----------------------- | ----------------------------- |
| 1      | Created                 | —                             |
| 2      | Specification completed | Specification text            |
| 3      | Development completed   | Branch name                   |
| 4      | Distribution completed  | Semantic version (e.g. 1.2.3) |
| Closed | —                       | Only from status 4            |

## Extensibility — Adding a New Task Type

The system uses a **Handler Registry** pattern to isolate task-type logic. The core workflow engine (`TaskWorkflowService`) has zero knowledge of individual task types — it delegates validation to the registered handler for that type. The client fetches `GET /api/tasks/config` at startup to learn `maxStatus` per type dynamically — no client constant to update.

Adding a new task type requires these steps and no changes to existing core logic.

### 1. Add the enum value to the schema

```prisma
// libs/data-access/prisma/schema.prisma
enum TaskType {
  PROCUREMENT
  DEVELOPMENT
  LEGAL           // add here
}
```

### 2. Create a handler class

```ts
// apps/api/src/app/task/handlers/legal.handler.ts
import { Injectable } from '@nestjs/common';
import { TaskTypeHandler } from '../interfaces/task-type-handler.interface';

@Injectable()
export class LegalHandler implements TaskTypeHandler {
  readonly type = 'LEGAL';
  readonly maxStatus = 3;

  validateStatusChange(
    toStatus: number,
    customFields: Record<string, unknown>,
  ): void {
    if (toStatus === 2 && !customFields['contractId']) {
      throw new Error('Contract ID is required at status 2');
    }
  }

  getFieldsForStatus(status: number): string[] {
    if (status === 2) return ['contractId'];
    return [];
  }
}
```

### 3. Register the handler in TaskModule

```ts
// apps/api/src/app/task/task.module.ts
const HANDLERS = [ProcurementHandler, DevelopmentHandler, LegalHandler]; // add here
```

That's the only line to change — the `useFactory` spreads the array dynamically.

### 4. Run a migration

```bash
cd libs/data-access && npx prisma migrate dev --name add-legal-task-type
```

The workflow engine, API routes, history recording, and client config endpoint all work automatically for the new type.

### 5. Add the client schema

```ts
// apps/client/src/app/components/tasks/legal/legal.schema.ts
import { z } from 'zod';

export const legalSchemas: Partial<Record<number, z.ZodTypeAny>> = {
  2: z.object({
    contractId: z.string().trim().min(1, 'Contract ID is required'),
  }),
};
```

### 6. Create the client form component

```tsx
// apps/client/src/app/components/tasks/legal/LegalFieldsForm.tsx
interface Props {
  toStatus: number;
  fields: Record<string, unknown>;
  onChange: (fields: Record<string, unknown>) => void;
}

export function LegalFieldsForm({ toStatus, fields, onChange }: Props) {
  const set = (key: string, value: unknown) =>
    onChange({ ...fields, [key]: value });

  if (toStatus === 2)
    return (
      <input
        placeholder="Contract ID"
        value={(fields['contractId'] as string) ?? ''}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        onChange={(e) => set('contractId', e.target.value)}
      />
    );

  return null;
}
```

### 7. Register in CustomFieldsForm and task-validation

```ts
// apps/client/src/app/components/tasks/task-validation.ts
import { legalSchemas } from './legal/legal.schema';

const schemas = {
  [TaskType.PROCUREMENT]: procurementSchemas,
  [TaskType.DEVELOPMENT]: developmentSchemas,
  [TaskType.LEGAL]: legalSchemas, // add here
};
```

```tsx
// apps/client/src/app/components/CustomFieldsForm.tsx
import { LegalFieldsForm } from './tasks/legal/LegalFieldsForm';

// add branch:
if (type === TaskType.LEGAL)
  return (
    <LegalFieldsForm toStatus={toStatus} fields={fields} onChange={onChange} />
  );
```
