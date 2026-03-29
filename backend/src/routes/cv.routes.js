import { Router } from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middlewares/middleware.js";
import validate from "../middlewares/validate.js";
import {
  createCvSchema,
  updateCvSchema,
  fullCvSchema,
} from "../validators/cv.schema.js";
import { idParamSchema } from "../validators/common.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
/**
 * @openapi
 * tags:
 *   - name: CV
 *     description: CV CRUD endpoints
 */

/**
 * @openapi
 * /api/cv:
 *   post:
 *     tags: [CV]
 *     summary: Create new CV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CVCreateRequest"
 *     responses:
 *       201:
 *         description: CV created
 *
 *   get:
 *     tags: [CV]
 *     summary: Get my CVs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of CVs
 */
const router = Router();

/**
 * @openapi
 * /api/cv/{id}/full:
 *   get:
 *     tags: [CV]
 *     summary: Get full CV with all related data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Full CV data
 *       404:
 *         description: CV not found
 */
// GET Full CV
// GET /api/cv/:id/full
router.get(
  "/:id/full",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const userId = req.user?.id ?? req.user?.userId;

    const cv = await prisma.CV.findUnique({
      where: { id },
      include: {
        educations: true,
        experiences: true,
        projects: true,
        skills: true,
      },
    });

    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    if (req.user.role !== "admin" && cv.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({
      ...cv,
      educations: cv.educations ?? [],
      experiences: cv.experiences ?? [],
      projects: cv.projects ?? [],
      skills: cv.skills ?? [],
    });
  }),
);

/**
 * POST /api/cv
 * إنشاء CV للمستخدم الحالي
 */
/**
 * @openapi
 * /api/cv:
 *   post:
 *     tags:
 *       - CV
 *     summary: Create new CV for logged-in user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, summary]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My CV
 *               summary:
 *                 type: string
 *                 example: Backend developer
 *     responses:
 *       201:
 *         description: CV created
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, validate(createCvSchema), async (req, res) => {
  try {
    const { title, summary, fullName } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }
    const cv = await prisma.cV.create({
      data: {
        title,
        summary: summary?.trim() || "",
        fullName: fullName?.trim() || "",
        user: {
          connect: { id: Number(req.user.id) },
        },
      },
    });

    return res.status(201).json(cv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/cv
 * جلب كل CVs للمستخدم الحالي
 */
/**
 * @openapi
 * /api/cv:
 *   get:
 *     tags:
 *       - CV
 *     summary: Get my CVs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of CVs
 */
/*router.get(
  "/:id/full",
  authMiddleware,
  validate(fullCvSchema),
  async (req, res) => {
    try {
      const cvs = await prisma.CV.findMany({
        where: { userId: req.user.id},
        orderBy: { id: "desc" },
      });

      return res.json(cvs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);*/

/**
 * GET /api/cv/:id
 * جلب CV واحد (فقط إن كان للمستخدم)
 */
router.get(
  "/:id",
  authMiddleware,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const cv = await prisma.CV.findUnique({
        where: { id },
        include: { educations: true },
      });

      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }

      if (req.user.role !== "admin" && cv.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.json(cv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * PUT /api/cv/:id
 * تعديل CV (title/summary) فقط إن كان للمستخدم
 */
router.put(
  "/:id",
  authMiddleware,
  validate(updateCvSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, summary, fullName } = req.body;

      const existing = await prisma.CV.findFirst({
        where: { id, userId: req.user.id },
      });

      if (!existing) return res.status(404).json({ message: "CV not found" });

      const updated = await prisma.CV.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          summary: summary ?? existing.summary,
          fullName: fullName ?? existing.fullName,
        },
      });

      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * DELETE /api/cv/:id
 * حذف CV (فقط إن كان للمستخدم)
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const existing = await prisma.CV.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) return res.status(404).json({ message: "CV not found" });

      await prisma.CV.delete({ where: { id } });

      return res.json({ message: "CV deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);
router.get("/", authMiddleware, async (req, res) => {
  try {
    let cvs;

    if (req.user.role === "admin") {
      cvs = await prisma.CV.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      cvs = await prisma.CV.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return res.json(cvs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load CVs" });
  }
});
export default router;
