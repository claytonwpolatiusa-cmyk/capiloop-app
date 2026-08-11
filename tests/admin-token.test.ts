import express from "express";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { registerAdminRoutes } from "../server/admin-rest";

describe("token administrativo", () => {
  let server: Server;
  let baseUrl = "";

  beforeAll(async () => {
    const app = express();
    registerAdminRoutes(app);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Porta de teste indisponível");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("aceita o token configurado e recusa um token incorreto", async () => {
    const valid = await fetch(`${baseUrl}/api/admin/health`, {
      headers: { "x-capiloop-admin-token": process.env.CAPI_LOOP_ADMIN_TOKEN ?? "" },
    });
    const invalid = await fetch(`${baseUrl}/api/admin/health`, {
      headers: { "x-capiloop-admin-token": "invalid-token" },
    });

    expect(valid.status).toBe(200);
    expect(invalid.status).toBe(401);
  });
});
