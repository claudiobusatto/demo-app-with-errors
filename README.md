# Demo App with errors

## What it does

- `GET /health` returns a healthy response.
- `GET /boom` throws a generic error (`Error`).
- `GET /error/type` throws a runtime `TypeError`.
- `GET /error/stack` throws from nested function calls to produce a richer stack trace.
- `GET /error/request-500` performs a request to a simulated upstream endpoint that returns `500` and reports the resulting request error.

## Setup

1. Install dependencies for the main repository:

```bash
bun install
```

2. Configure demo env:

```bash
cp .env.example .env
```

## Available endpoints

Trigger one or more error endpoints:

```bash
curl -i http://localhost:4000/boom
curl -i http://localhost:4000/error/type
curl -i http://localhost:4000/error/stack
curl -i http://localhost:4000/error/request-500
```

To watch demo logs in real time:

```bash
tail -f demo-app.log
```
