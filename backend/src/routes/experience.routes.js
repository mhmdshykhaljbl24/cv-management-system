import { Router } from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middlewares/middleware.js";
import validate from "../middlewares/validate.js";
import {
  createExperienceSchema,
  updateExperienceSchema,
} from "../validators/experience.schema.js";
import { cvIdParamSchema, idParamSchema } from "../validators/common.schema.js";

/**
 * @openapi
 * tags:
 *   - name: Experience
 *     description: Experience endpoints
 */

/**
 * @openapi
 * /api/experience/cv/{cvId}:
 *   post:
 *     tags:
 *       - Experience
 *     summary: Add experience to CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienceCreateRequest'
 *     responses:
 *       201:
 *         description: Experience added
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: CV not found
 *       500:
 *         description: Internal Server Error
 */
const router = Router();

/**
 * CREATE Experience for a CV
 * POST /api/experience/cv/:cvId
 */
router.post(
  "/cv/:cvId",
  authMiddleware,
  validate(createExperienceSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);

      // تأكد CV للمستخدم
      const cv = await prisma.CV.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });
      if (!cv) return res.status(404).json({ message: "CV not found" });

      const { company, country, city, position, startDate, endDate } = req.body;

      if (!company || !position || !startDate) {
        return res.status(400).json({
          message: "company, position, startDate are required",
        });
      }

      const experience = await prisma.experience.create({
        data: {
          company,
          country: country ?? null,
          city: city ?? null,
          position,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          cvId,
        },
      });
      await prisma.CV.update({
        where: { id: cv.id },
        data: { updatedAt: new Date() },
      });

      return res.status(201).json(experience);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * GET all experiences for a CV
 * GET /api/experience/cv/:cvId
 */
/**
 * @openapi
 * /api/experience/cv/{cvId}:
 *   get:
 *     tags: [Experience]
 *     summary: Get experience list for a CV
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
 *         description: Experience list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ExperienceResponse"
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

      const list = await prisma.experience.findMany({
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
 * UPDATE Experience
 * PUT /api/experience/:id
 */
/**
 * @openapi
 * /api/experience/{id}:
 *   put:
 *     tags: [Experience]
 *     summary: Update experience by id
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
 *             $ref: "#/components/schemas/ExperienceUpdateRequest"
 *     responses:
 *       200:
 *         description: Experience updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExperienceResponse"
 *       404:
 *         description: Experience not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put(
  "/:id",
  authMiddleware,
  validate(updateExperienceSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const exp = await prisma.experience.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!exp)
        return res.status(404).json({ message: "Experience not found" });
      if (exp.cv.userId !== Number(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { company, country, city, position, startDate, endDate } = req.body;

      const updated = await prisma.experience.update({
        where: { id },
        data: {
          company: company ?? exp.company,
          country: country ?? exp.country,
          city: city ?? exp.city,
          position: position ?? exp.position,
          startDate: startDate ? new Date(startDate) : exp.startDate,
          endDate:
            endDate === undefined
              ? exp.endDate
              : endDate
                ? new Date(endDate)
                : null,
        },
      });
      await prisma.CV.update({
        where: { id: exp.cv.id },
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
 * DELETE Experience
 * DELETE /api/experience/:id
 */
/**
 * @openapi
 * /api/experience/{id}:
 *   delete:
 *     tags: [Experience]
 *     summary: Delete experience by id
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
 *         description: Experience deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       404:
 *         description: Experience not found
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

      const exp = await prisma.experience.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!exp)
        return res.status(404).json({ message: "Experience not found" });
      if (exp.cv.userId !== req.user.userId)
        return res.status(403).json({ message: "Forbidden" });
      await prisma.CV.update({
        where: { id: exp.cv.id },
        data: { updatedAt: new Date() },
      });
      await prisma.experience.delete({ where: { id } });

      return res.json({ message: "Experience deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);
export default router;
