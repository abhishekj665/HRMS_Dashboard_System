import express from "express";
import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import {
  AUTH_REQUEST_LIMIT,
  RATE_LIMIT_WINDOW_MS,
  STANDARD_REQUEST_LIMIT,
  authRateLimiter,
  createRateLimiter,
  shouldSkipStandardRateLimit,
} from "../rateLimit.middleware.js";

let server;
let baseUrl;

beforeEach(async () => {
  const app = express();
  app.use(createRateLimiter({
    windowMs: 60_000,
    limit: 2,
    message: "Slow down",
    skip: (req) => req.path === "/webhook",
  }));
  app.get("/resource", (_req, res) => res.json({ success: true }));
  app.get("/webhook", (_req, res) => res.json({ success: true }));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("createRateLimiter", () => {
  test("uses the documented standard and authentication budgets", () => {
    expect(RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(STANDARD_REQUEST_LIMIT).toBe(300);
    expect(AUTH_REQUEST_LIMIT).toBe(12);
    expect(shouldSkipStandardRateLimit({ path: "/payment/webhook" })).toBe(true);
    expect(shouldSkipStandardRateLimit({ path: "/payment/order/create" })).toBe(false);
  });

  test("allows requests within the window and returns 429 after the configured limit", async () => {
    const first = await fetch(`${baseUrl}/resource`);
    const second = await fetch(`${baseUrl}/resource`);
    const third = await fetch(`${baseUrl}/resource`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    await expect(third.json()).resolves.toEqual({
      success: false,
      message: "Slow down",
    });
  });

  test("returns standard rate limit headers and omits legacy headers", async () => {
    const response = await fetch(`${baseUrl}/resource`);

    expect(response.headers.has("ratelimit-limit")).toBe(true);
    expect(response.headers.has("x-ratelimit-limit")).toBe(false);
    expect(response.headers.has("x-ratelimit-remaining")).toBe(false);
  });

  test("can exclude provider webhooks from the browser request budget", async () => {
    const responses = await Promise.all([
      fetch(`${baseUrl}/webhook`),
      fetch(`${baseUrl}/webhook`),
      fetch(`${baseUrl}/webhook`),
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  test("allows requests again after the configured window expires", async () => {
    const app = express();
    app.use(createRateLimiter({ windowMs: 80, limit: 1 }));
    app.get("/resource", (_req, res) => res.sendStatus(200));
    const shortWindowServer = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => shortWindowServer.once("listening", resolve));
    const url = `http://127.0.0.1:${shortWindowServer.address().port}/resource`;

    try {
      expect((await fetch(url)).status).toBe(200);
      expect((await fetch(url)).status).toBe(429);
      await new Promise((resolve) => setTimeout(resolve, 120));
      expect((await fetch(url)).status).toBe(200);
    } finally {
      shortWindowServer.closeAllConnections();
      await new Promise((resolve, reject) => {
        shortWindowServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  test("applies the tighter authentication request budget", async () => {
    const app = express();
    app.use(authRateLimiter);
    app.post("/auth/login", (_req, res) => res.sendStatus(200));
    const authServer = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => authServer.once("listening", resolve));
    const url = `http://127.0.0.1:${authServer.address().port}/auth/login`;

    try {
      const statuses = [];
      for (let attempt = 0; attempt <= AUTH_REQUEST_LIMIT; attempt += 1) {
        statuses.push((await fetch(url, { method: "POST" })).status);
      }
      expect(statuses.slice(0, AUTH_REQUEST_LIMIT).every((status) => status === 200)).toBe(true);
      expect(statuses.at(-1)).toBe(429);
    } finally {
      authServer.closeAllConnections();
      await new Promise((resolve, reject) => {
        authServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
