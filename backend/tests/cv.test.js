import request from "supertest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import app from "../src/app.js";

async function registerAndLogin(email, password) {
  await request(app).post("/api/auth/register").send({ email, password });
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return login.body.token;
}

describe("CV", () => {
  test("Create CV requires token", async () => {
    const res = await request(app)
      .post("/api/cv")
      .send({ fullName: "test user", title: "My CV", summary: "Backend dev" });

    expect([401, 403]).toContain(res.statusCode);
  });

  test("Create, list, update, full, delete CV", async () => {
    const token = await registerAndLogin("cv_user@test.com", "12345678");

    const create = await request(app)
      .post("/api/cv")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "test user", title: "My CV", summary: "Backend dev" });

    expect([200, 201]).toContain(create.statusCode);
    const cvId = create.body.id;
    expect(cvId).toBeDefined();

    const list = await request(app)
      .get("/api/cv")
      .set("Authorization", ` Bearer ${token}`);

    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const update = await request(app)
      .put(`/api/cv/${cvId}`)
      .set("Authorization", ` Bearer ${token}`)
      .send({ title: "Updated CV" });

    expect([200, 201]).toContain(update.statusCode);
    const full = await request(app)
      .get(`/api/cv/${cvId}/full`)
      .set("Authorization", `Bearer ${token}`);

    expect(full.statusCode).toBe(200);
    expect(full.body.educations).toBeDefined();
    expect(full.body.experiences).toBeDefined();
    expect(full.body.projects).toBeDefined();
    expect(full.body.skills).toBeDefined();

    const del = await request(app)
      .delete(`/api/cv/${cvId}`)
      .set("Authorization", ` Bearer ${token}`);

    expect([200, 204]).toContain(del.statusCode);
  });

  test("User cannot access another user's CV (should be 404/403)", async () => {
    const token1 = await registerAndLogin("u1@test.com", "12345678");
    const token2 = await registerAndLogin("u2@test.com", "12345678");

    const create = await request(app)
      .post("/api/cv")
      .set("Authorization", `Bearer ${token1}`)
      .send({ fullName: "test user", title: "U1 CV", summary: "..." });

    const cvId = create.body.id;

    const res = await request(app)
      .get(`/api/cv/${cvId}/full`)
      .set("Authorization", `Bearer ${token2}`);
    expect([403, 404]).toContain(res.statusCode);
  });
});
