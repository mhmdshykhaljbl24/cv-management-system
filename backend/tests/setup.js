import dotenv from "dotenv";
import { execSync } from "child_process";
import prisma from "../src/utils/prisma.js";

dotenv.config({ path: ".env.test" });

beforeAll(() => {
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
