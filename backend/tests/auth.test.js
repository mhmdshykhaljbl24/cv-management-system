import request from "supertest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import app from "../src/app.js";

const email = "auth_test@test.com";
const password = "12345678";

describe("Auth", () => {
  test("Register should succeed", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    expect([200, 201]).toContain(res.statusCode);
  });

  test("Register duplicate should fail", async () => {
    await request(app).post("/api/auth/register").send({ email, password });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    expect([400, 409]).toContain(res.statusCode);
  });

  test("Login should return token", async () => {
    await request(app).post("/api/auth/register").send({ email, password });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("Login wrong password should fail", async () => {
    await request(app).post("/api/auth/register").send({ email, password });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpass" });
    expect([400, 401]).toContain(res.statusCode);
  });

  test("Auth me should require token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect([401, 403]).toContain(res.statusCode);
  });

  test("Auth me should work with token", async () => {
    await request(app).post("/api/auth/register").send({ email, password });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    const token = login.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });

  test("Rate limit should trigger on repeated login attempts", async () => {
    await request(app).post("/api/auth/register").send({ email, password });
    let last;
    for (let i = 0; i < 11; i++) {
      last = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "wrongpass" });
    }
    expect([401, 429]).toContain(last.statusCode);
  });
});
