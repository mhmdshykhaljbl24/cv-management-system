import helmet from "helmet";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import cvRoutes from "./routes/cv.routes.js";
import educationRoutes from "./routes/education.routes.js";
import experienceRoutes from "./routes/experience.routes.js";
import projectRoutes from "./routes/project.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import morgan from "morgan";
import dashboardRoutes from "./routes/dashboard.routes.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware.js";

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cv-management-system-kbdr.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/skill", skillRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});
app.use(notFoundHandler);
app.use(globalErrorHandler);
export default app;
