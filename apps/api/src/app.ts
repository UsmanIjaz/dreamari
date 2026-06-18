import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import { fromNodeHeaders } from "better-auth/node";

import { auth, TRUSTED_ORIGINS } from "./auth";
import { httpError } from "./lib/http";
import { healthRoutes } from "./routes/health";
import { inviteRoutes } from "./routes/invite";
import { buildRoutes } from "./routes/build";
import { matchRoutes } from "./routes/match";
import { swipeRoutes } from "./routes/swipes";
import { reportRoutes } from "./routes/report";
import { contentRoutes } from "./routes/content";
import { adminRoutes } from "./routes/admin";
import { schoolRoutes } from "./routes/schools";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: { id: string; role: string; isAnonymous: boolean };
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireStudent: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const SWAGGER_HTML = `<!doctype html><html><head><meta charset="utf-8"/><title>Dreamari API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/></head>
<body><div id="ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.onload=()=>SwaggerUIBundle({url:'/openapi.json',dom_id:'#ui'})</script>
</body></html>`;

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export async function buildApp(): Promise<FastifyInstance> {
  // trustProxy so req.ip reflects the real client (we sit behind Railway + the web-app proxy),
  // which makes per-client rate limiting work instead of bucketing everyone under the proxy IP.
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" }, trustProxy: true });

  app.setErrorHandler((err, req, reply) => {
    const status = err.statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    // Never leak internal/Prisma details to clients; only surface explicit 4xx messages.
    const message = status >= 500 ? "Internal Server Error" : (err.message ?? "Request error");
    reply.code(status).send({ statusCode: status, error: message });
  });

  // credentials: true so the session cookie flows; origin locked to the known web apps
  // (the apps reach us same-origin via a proxy, so their forwarded Origin is on this list).
  await app.register(cors, { origin: TRUSTED_ORIGINS, credentials: true });

  // Per-client rate limit (generous for normal use; stops naive enumeration/abuse).
  // Auth endpoints have their own tighter limit via Better Auth.
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  // ---- mount Better Auth at /api/auth/* (bridge Fastify <-> web Request/Response) ----
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: { hide: true },
    async handler(request, reply) {
      const headers = new Headers();
      for (const [k, v] of Object.entries(request.headers)) {
        if (v) headers.append(k, Array.isArray(v) ? v.join(",") : String(v));
      }
      const webReq = new Request(new URL(request.url, API_URL), {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : JSON.stringify(request.body ?? {}),
      });
      const res = await auth.handler(webReq);
      reply.status(res.status);
      const setCookies = res.headers.getSetCookie?.() ?? [];
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") reply.header(key, value);
      });
      if (setCookies.length) reply.header("set-cookie", setCookies);
      reply.send(res.body ? await res.text() : null);
    },
  });

  // ---- session-based guards ----
  const load = async (req: FastifyRequest) =>
    auth.api.getSession({ headers: fromNodeHeaders(req.raw.headers) });

  app.decorate("authenticate", async (req: FastifyRequest) => {
    const s = await load(req);
    if (!s) throw httpError(401, "Unauthorized");
    req.authUser = { id: s.user.id, role: s.user.role ?? "user", isAnonymous: Boolean(s.user.isAnonymous) };
  });
  app.decorate("requireStudent", async (req: FastifyRequest) => {
    const s = await load(req);
    if (!s) throw httpError(401, "Unauthorized");
    // any authenticated non-admin (incl. anonymous guests) acts as a student
    req.authUser = { id: s.user.id, role: s.user.role ?? "user", isAnonymous: Boolean(s.user.isAnonymous) };
  });
  app.decorate("requireAdmin", async (req: FastifyRequest) => {
    const s = await load(req);
    if (!s) throw httpError(401, "Unauthorized");
    if (s.user.role !== "admin") throw httpError(403, "Forbidden");
    req.authUser = { id: s.user.id, role: "admin", isAnonymous: false };
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Dreamari API",
        description: "BUILD → MATCH → Career Report. Auth via Better Auth (sessions at /api/auth/*).",
        version: "1.0.0",
      },
      components: { securitySchemes: { cookieAuth: { type: "apiKey", in: "cookie", name: "better-auth.session_token" } } },
    },
  });

  await app.register(healthRoutes);
  await app.register(
    async (v1) => {
      await v1.register(inviteRoutes, { prefix: "/invite" });
      await v1.register(buildRoutes, { prefix: "/build" });
      await v1.register(matchRoutes, { prefix: "/match" });
      await v1.register(swipeRoutes, { prefix: "/swipes" });
      await v1.register(reportRoutes, { prefix: "/report" });
      await v1.register(contentRoutes);
      await v1.register(adminRoutes, { prefix: "/admin" });
      await v1.register(schoolRoutes, { prefix: "/admin" });
    },
    { prefix: "/v1" },
  );

  app.get("/openapi.json", { schema: { hide: true } }, async () => app.swagger());
  app.get("/docs", { schema: { hide: true } }, async (_req, reply) => {
    reply.type("text/html").send(SWAGGER_HTML);
  });

  return app;
}
