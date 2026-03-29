import { Router } from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middlewares/middleware.js";
import validate from "../middlewares/validate.js";
import {
  createSkillSchema,
  updateSkillSchema,
} from "../validators/skill.schema.js";

import { cvIdParamSchema, idParamSchema } from "../validators/common.schema.js";
/**
 * @openapi
 * tags:
 *   - name: Skill
 *     description: Skill endpoints
 */

/**
 * @openapi
 * /api/skill/cv/{cvId}:
 *   post:
 *     tags: [Skill]
 *     summary: Add skill to CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Skill added
 */
const router = Router();

/**
 * CREATE Skill for a CV
 * POST /api/skill/cv/:cvId
 */
router.post(
  "/cv/:cvId",
  authMiddleware,
  validate(createSkillSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);
      const cv = await prisma.CV.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });
      if (!cv) return res.status(404).json({ message: "CV not found" });

      const { name, level } = req.body;

      if (!name) return res.status(400).json({ message: "name is required" });

      const lvl = Number(level);
      if (Number.isNaN(lvl) || lvl < 0 || lvl > 100) {
        return res
          .status(400)
          .json({ message: "level must be between 0 and 100" });
      }

      const skill = await prisma.skill.create({
        data: {
          name,
          level: lvl,
          cvId,
        },
      });
      await prisma.CV.update({
        where: { id: cv.id },
        data: { updatedAt: new Date() },
      });
      return res.status(201).json(skill);
    } catch (err) {
      // لو عندك @@unique([cvId, name]) قد يعطي خطأ عند تكرار نفس المهارة
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * GET Skills for a CV
 * GET /api/skill/cv/:cvId
 */
/**
 * @openapi
 * /api/skill/cv/{cvId}:
 *   get:
 *     tags: [Skill]
 *     summary: Get skill list for a CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Skill list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/SkillResponse"
 *       404:
 *         description: CV not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/cv/:cvId",
  authMiddleware,
  validate(cvIdParamSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);

      const cv = await prisma.CV.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });
      if (!cv) return res.status(404).json({ message: "CV not found" });

      const list = await prisma.skill.findMany({
        where: { cvId },
        orderBy: { id: "desc" },
      });

      return res.json(list);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * UPDATE Skill
 * PUT /api/skill/:id
 */
/**
 * @openapi
 * /api/skill/{id}:
 *   put:
 *     tags: [Skill]
 *     summary: Update skill by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SkillUpdateRequest"
 *     responses:
 *       200:
 *         description: Skill updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SkillResponse"
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put(
  "/:id",
  authMiddleware,
  validate(updateSkillSchema),
  validate(idParamSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const sk = await prisma.skill.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!sk) return res.status(404).json({ message: "Skill not found" });
      if (sk.cv.userId !== Number(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { name, level } = req.body;

      let lvl = sk.level;
      if (level !== undefined) {
        lvl = Number(level);
        if (Number.isNaN(lvl) || lvl < 0 || lvl > 100) {
          return res
            .status(400)
            .json({ message: "level must be between 0 and 100" });
        }
      }

      const updated = await prisma.skill.update({
        where: { id },
        data: {
          name: name ?? sk.name,
          level: lvl,
        },
      });
      await prisma.CV.update({
        where: { id: sk.cv.id },
        data: { updatedAt: new Date() },
      });
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * DELETE Skill
 * DELETE /api/skill/:id
 */
/**
 * @openapi
 * /api/skill/{id}:
 *   delete:
 *     tags: [Skill]
 *     summary: Delete skill by id
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
 *         description: Skill deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const sk = await prisma.skill.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!sk) return res.status(404).json({ message: "Skill not found" });
      if (sk.cv.userId !== req.user.userId)
        return res.status(403).json({ message: "Forbidden" });

      await prisma.skill.delete({ where: { id } });
      await prisma.CV.update({
        where: { id: sk.cv.id },
        data: { updatedAt: new Date() },
      });
      return res.json({ message: "Skill deleted" });
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
