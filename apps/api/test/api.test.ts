import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

// These tests verify app wiring, content routes, and RBAC — none of them touch
// the database, so they run with zero infrastructure.
let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});
afterAll(async () => {
  await app.close();
});

describe("content routes", () => {
  it("serves all 16 careers and 12 majors", async () => {
    const careers = await app.inject({ method: "GET", url: "/v1/careers" });
    expect(careers.statusCode).toBe(200);
    expect(careers.json().careers).toHaveLength(16);

    const majors = await app.inject({ method: "GET", url: "/v1/majors" });
    expect(majors.json().majors).toHaveLength(12);
  });
});

describe("auth / RBAC", () => {
  it("rejects protected student routes without a token", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/build" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ statusCode: 401, error: "Unauthorized" });
  });

  it("rejects admin routes without a token", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/admin/students" });
    expect(res.statusCode).toBe(401);
  });
});

describe("openapi", () => {
  it("exposes a spec with the documented paths", async () => {
    const res = await app.inject({ method: "GET", url: "/openapi.json" });
    expect(res.statusCode).toBe(200);
    const keys = Object.keys(res.json().paths);
    expect(keys.some((k) => k.startsWith("/v1/match"))).toBe(true);
    expect(keys.some((k) => k.startsWith("/v1/report"))).toBe(true);
  });
});
