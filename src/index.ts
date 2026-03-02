import { appendFileSync } from "node:fs";

const port = Number(process.env.PORT ?? 4000);
const logFile = process.env.LOG_FILE ?? "./demo-app.log";

function writeLog(event: string, data?: Record<string, unknown>) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...(data ?? {}),
  });

  appendFileSync(logFile, `${line}\n`);
}

function createStackTraceError(): never {
  function deepLevel() {
    throw new Error("Stack trace demo error from nested calls");
  }
  function midLevel() {
    deepLevel();
  }
  function topLevel() {
    midLevel();
  }
  topLevel();
}

async function reportError(error: Error, endpoint: string, details?: Record<string, unknown>) {
  writeLog("error_captured", {
    endpoint,
    error: error.message,
    type: error.name,
    stack: error.stack ?? null,
    details: details ?? null,
  });

  return Response.json(
    {
      error: error.message,
      type: error.name,
      endpoint,
    },
    { status: 500 },
  );
}

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    console.log(`[demo-app] ${method} ${url.pathname}`);
    writeLog("request", { method, path: url.pathname });

    if (method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok", service: "demo-app-with-errors" });
    }

    if (method === "GET" && url.pathname === "/boom") {
      try {
        throw new Error("Demo error from /boom endpoint");
      } catch (error) {
        return reportError(error as Error, "/boom");
      }
    }

    if (method === "GET" && url.pathname === "/error/type") {
      try {
        const payload = null as unknown as { value: string };
        return Response.json({ value: payload.value.toUpperCase() });
      } catch (error) {
        return reportError(error as Error, "/error/type");
      }
    }

    if (method === "GET" && url.pathname === "/error/stack") {
      try {
        createStackTraceError();
      } catch (error) {
        return reportError(error as Error, "/error/stack");
      }
    }

    if (method === "GET" && url.pathname === "/upstream-500") {
      writeLog("upstream_500", { path: "/upstream-500" });
      return Response.json(
        { error: "Simulated upstream failure", source: "demo-app upstream route" },
        { status: 500 },
      );
    }

    if (method === "GET" && url.pathname === "/error/request-500") {
      try {
        const upstreamUrl = `http://127.0.0.1:${port}/upstream-500`;
        const upstreamRes = await fetch(upstreamUrl);
        if (!upstreamRes.ok) {
          throw new Error(`Upstream request failed with status ${upstreamRes.status}`);
        }
        return Response.json({ ok: true });
      } catch (error) {
        return reportError(error as Error, "/error/request-500", { kind: "request_error" });
      }
    }

    return Response.json({ error: "Not Found" }, { status: 404 });
  },
});

console.log(`Demo app listening on ${server.url}`);
writeLog("server_started", { url: server.url.toString(), port, logFile });
