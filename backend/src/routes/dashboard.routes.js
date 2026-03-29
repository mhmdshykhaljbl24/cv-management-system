import { Router } from "express";
import authMiddleware from "../middlewares/middleware.js";

import {
  getMyDashboardSummary,
  getAdminDashboardSummary,
} from "../controlles/dashboard.controller.js";

const router = Router();
/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     summary: Get my dashboard summary
 *     responses:
 *       200:
 *         description: Summary returned
 */
router.get("/summary", authMiddleware, getMyDashboardSummary);
router.get("/admin/summary", authMiddleware, getAdminDashboardSummary);

export default router;
