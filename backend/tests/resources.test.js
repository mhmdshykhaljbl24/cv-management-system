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

async function createCv(token) {
  const res = await request(app)
    .post("/api/cv")
    .set("Authorization", `Bearer ${token}`)
    .send({ fullName: "fullname", title: "My CV", summary: "Backend dev" });
  return res.body.id;
}

describe("Education/Experience/Project/Skill", () => {
  test("Unauthorized should be blocked", async () => {
    const res = await request(app)
      .post("/api/skill/cv/1")
      .send({ name: "React", level: 80 });

    expect([401, 403]).toContain(res.statusCode);
  });

  test("Education CRUD + validation", async () => {
    const token = await registerAndLogin("edu@test.com", "12345678");
    const cvId = await createCv(token);

    // Create OK
    const create = await request(app)
      .post(`/api/education/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        university: "Damascus University",
        country: "Syria",
        city: "Damascus",
        degree: "Bachelor",
        major: "CS",
        gpa: 2.8,
        graduationYear: 2023,
      });

    expect([200, 201]).toContain(create.statusCode);
    const eduId = create.body.id;

    // Validation error: year invalid
    const bad = await request(app)
      .post(`/api/education/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        university: "DU",
        country: "SY",
        city: "DM",
        degree: "BA",
        major: "CS",
        gpa: 2.8,
        graduationYear: "hello",
      });

    expect(bad.statusCode).toBe(400);

    // Update
    const update = await request(app)
      .put(`/api/education/${eduId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ city: "Aleppo" });

    expect([200, 201]).toContain(update.statusCode);

    // Delete
    const del = await request(app)
      .delete(`/api/education/${eduId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(del.statusCode);
  });

  test("Experience CRUD + validation", async () => {
    const token = await registerAndLogin("exp@test.com", "12345678");
    const cvId = await createCv(token);

    const create = await request(app)
      .post(`/api/experience/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company: "ABC",
        country: "Syria",
        city: "Damascus",
        position: "Backend Dev",
        startDate: "2024-01-01",
        endDate: null,
      });

    expect([200, 201]).toContain(create.statusCode);
    const expId = create.body.id;

    // Bad: missing required company
    const bad = await request(app)
      .post(`/api/experience/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        country: "Syria",
        city: "Damascus",
        position: "Backend Dev",
        startDate: "2024-01-01",
      });

    expect(bad.statusCode).toBe(400);

    const update = await request(app)
      .put(`/api/experience/${expId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ city: "Homs" });

    expect([200, 201]).toContain(update.statusCode);

    const del = await request(app)
      .delete(`/api/experience/${expId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(del.statusCode);
  });

  test("Project CRUD + validation", async () => {
    const token = await registerAndLogin("proj@test.com", "12345678");
    const cvId = await createCv(token);
    const create = await request(app)
      .post(`/api/project/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company: "ABC",
        name: "CV Platform",
        role: "API Dev",
        technologies: "Node, Express, PostgreSQL",
      });

    expect([200, 201]).toContain(create.statusCode);
    const projectId = create.body.id;

    // Bad: name too short/missing
    const bad = await request(app)
      .post(`/api/project/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company: "ABC",
        name: "",
        role: "API Dev",
        technologies: "Node",
      });

    expect(bad.statusCode).toBe(400);

    const update = await request(app)
      .put(`/api/project/${projectId}`)
      .set("Authorization", ` Bearer ${token}`)
      .send({ role: "Backend Dev" });

    expect([200, 201]).toContain(update.statusCode);

    const del = await request(app)
      .delete(`/api/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(del.statusCode);
  });

  test("Skill CRUD + validation (0..100)", async () => {
    const token = await registerAndLogin("skill@test.com", "12345678");
    const cvId = await createCv(token);

    const create = await request(app)
      .post(`/api/skill/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "React", level: 80 });

    expect([200, 201]).toContain(create.statusCode);
    const skillId = create.body.id;

    // Bad: level > 100
    const bad = await request(app)
      .post(`/api/skill/cv/${cvId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "BadSkill", level: 200 });

    expect(bad.statusCode).toBe(400);

    const update = await request(app)
      .put(`/api/skill/${skillId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ level: 90 });

    expect([200, 201]).toContain(update.statusCode);

    const del = await request(app)
      .delete(`/api/skill/${skillId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(del.statusCode);
  });
});
