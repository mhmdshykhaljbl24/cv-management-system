import { Router } from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middlewares/middleware.js";
import validate from "../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.schema.js";

import { cvIdParamSchema, idParamSchema } from "../validators/common.schema.js";
/**
 * @openapi
 * tags:
 *   - name: Project
 *     description: Project endpoints
 */

/**
 * @openapi
 * /api/project/cv/{cvId}:
 *   post:
 *     tags: [Project]
 *     summary: Add project to CV
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
 *         description: Project added
 */
const router = Router();

/**
 * CREATE Project for a CV
 * POST /api/project/cv/:cvId
 */
router.post(
  "/cv/:cvId",
  authMiddleware,
  validate(createProjectSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);

      const cv = await prisma.CV.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });
      if (!cv) return res.status(404).json({ message: "CV not found" });
      const { name, link, description, role, technologies } = req.body;

      if (!name) {
        return res.status(400).json({ message: "name is required" });
      }
      const project = await prisma.project.create({
        data: {
          name,
          link: link ?? null,
          description: description ?? null,
          role: role ?? null,
          technologies: technologies ?? null,
          cvId,
        },
      });
      await prisma.CV.update({
        where: { id: cv.id },
        data: { updatedAt: new Date() },
      });
      return res.status(201).json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * GET Projects for a CV
 * GET /api/project/cv/:cvId
 */
/**
 * @openapi
 * /api/project/cv/{cvId}:
 *   get:
 *     tags: [Project]
 *     summary: Get project list for a CV
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
 *         description: Project list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ProjectResponse"
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

      const list = await prisma.project.findMany({
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
 * UPDATE Project
 * PUT /api/project/:id
 */
/**
 * @openapi
 * /api/project/{id}:
 *   put:
 *     tags: [Project]
 *     summary: Update project by id
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
 *             $ref: "#/components/schemas/ProjectUpdateRequest"
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProjectResponse"
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put(
  "/:id",
  authMiddleware,
  validate(updateProjectSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const proj = await prisma.project.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!proj) return res.status(404).json({ message: "Project not found" });
      if (proj.cv.userId !== Number(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { company, name, role, technologies, link, description } = req.body;

      const updated = await prisma.project.update({
        where: { id },
        data: {
          company: company ?? proj.company,
          name: name ?? proj.name,
          role: role ?? proj.role,
          technologies: technologies ?? proj.technologies,
          link:
            link === undefined
              ? proj.link
              : link === "" || link === null
                ? null
                : link,
          description:
            description === undefined
              ? proj.description
              : description === "" || description === null
                ? null
                : description,
        },
      });
      await prisma.CV.update({
        where: { id: proj.cv.id },
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
 * DELETE Project
 * DELETE /api/project/:id
 */
/**
 * @openapi
 * /api/project/{id}:
 *   delete:
 *     tags: [Project]
 *     summary: Delete project by id
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
 *         description: Project deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       404:
 *         description: Project not found
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

      const proj = await prisma.project.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!proj) return res.status(404).json({ message: "Project not found" });
      if (proj.cv.userId !== req.user.userId)
        return res.status(403).json({ message: "Forbidden" });

      await prisma.project.delete({ where: { id } });
      await prisma.CV.update({
        where: { id: proj.cv.id },
        data: { updatedAt: new Date() },
      });
      return res.json({ message: "Project deleted" });
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
