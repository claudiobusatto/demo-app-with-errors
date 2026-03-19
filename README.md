# Todo List App (Bun + In-Memory API)

Small Bun app that serves:

- a browser UI at `/`
- a JSON API for users and todos
- in-memory storage (everything resets on restart)
- error reporting to CoolKeeper on unhandled runtime errors

## Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

`COOL_KEEPER_ORG_ID` and `COOL_KEEPER_API_KEY` are required by runtime config validation (`zod`), so the app will fail at startup if they are missing.

## Run

Development (watch mode):

```bash
bun run dev
```

Production-style:

```bash
bun run start
```

The app listens on **http://localhost:4000** by default (override with `PORT`).
