import { Router } from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middlewares/middleware.js";
import validate from "../middlewares/validate.js";
import { cvIdParamSchema, idParamSchema } from "../validators/common.schema.js";
import {
  createEducationSchema,
  updateEducationSchema,
} from "../validators/education.schema.js";

/**
 * @openapi
 * tags:
 *   - name: Education
 *     description: Education endpoints
 */

/**
 * @openapi
 * /api/education/cv/{cvId}:
 *   post:
 *     tags: [Education]
 *     summary: Add education to CV
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
 *             $ref: "#/components/schemas/EducationCreateRequest"
 *     responses:
 *       201:
 *         description: Education added
 */
const router = Router();

/**
 * POST /api/education
 * إضافة شهادة ل CV محدد
 * body: { cvId, university, country, city, degree, major, gpa, graduationYear }
 */
router.post(
  "/education/cv/:cvId",
  authMiddleware,
  validate(createEducationSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);

      const { university, country, city, degree, major, gpa, graduationYear } =
        req.body;

      const cv = await prisma.cV.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });

      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }

      const education = await prisma.education.create({
        data: {
          cvId: cv.id,
          university,
          country,
          city,
          degree,
          major,
          gpa: gpa === undefined || gpa === null ? null : Number(gpa),
          graduationYear:
            graduationYear === undefined || graduationYear === null
              ? null
              : Number(graduationYear),
        },
      });
      await prisma.CV.update({
        where: { id: cv.id },
        data: { updatedAt: new Date() },
      });

      return res.status(201).json(education);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * GET /api/education/:cvId
 * جلب كل الشهادات ل CV معين (فقط إن كان للمستخدم)
 */
/**
 * @openapi
 * /api/education/cv/{cvId}:
 *   get:
 *     tags: [Education]
 *     summary: Get education list for a CV
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
 *         description: Education list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/EducationResponse"
 *       404:
 *         description: CV not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/education/cv/:cvId",
  authMiddleware,
  validate(cvIdParamSchema),
  async (req, res) => {
    try {
      const cvId = Number(req.params.cvId);

      const cv = await prisma.CV.cv.findFirst({
        where: { id: cvId, userId: req.user.userId },
      });

      if (!cv) return res.status(404).json({ message: "CV not found" });

      const list = await prisma.CV.education.findMany({
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
 * PUT /api/education/item/:id
 * تعديل شهادة واحدة (لازم تكون ضمن CV للمستخدم)
 */
/**
 * @openapi
 * /api/education/{id}:
 *   put:
 *     tags: [Education]
 *     summary: Update education by id
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
 *             $ref: "#/components/schemas/EducationUpdateRequest"
 *     responses:
 *       200:
 *         description: Education updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/EducationResponse"
 *       404:
 *         description: Education not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put(
  "/education/:id",
  authMiddleware,
  validate(updateEducationSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const edu = await prisma.education.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!edu) return res.status(404).json({ message: "Education not found" });

      if (edu.cv.userId !== Number(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { university, country, city, degree, major, gpa, graduationYear } =
        req.body;
      let gy;

      if (graduationYear === undefined) {
        gy = edu.graduationYear;
      } else if (graduationYear === null || graduationYear === "") {
        gy = null;
      } else {
        const parsed = Number(graduationYear);
        gy = Number.isNaN(parsed) ? edu.graduationYear : parsed;
      }

      const updated = await prisma.education.update({
        where: { id },
        data: {
          university: university ?? edu.university,
          country: country ?? edu.country,
          city: city ?? edu.city,
          degree: degree ?? edu.degree,
          major: major ?? edu.major,

          gpa: gpa === undefined ? edu.gpa : gpa === null ? null : Number(gpa),

          graduationYear: gy,
        },
      });
      await prisma.CV.update({
        where: { id: edu.cv.id },
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
 * DELETE /api/education/item/:id
 * حذف شهادة واحدة (لازم تكون ضمن CV للمستخدم)
 */
/**
 * @openapi
 * /api/education/{id}:
 *   delete:
 *     tags: [Education]
 *     summary: Delete education by id
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
 *         description: Education deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       404:
 *         description: Education not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.delete(
  "/education/:id",
  authMiddleware,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const edu = await prisma.education.findUnique({
        where: { id },
        include: { cv: true },
      });

      if (!edu || edu.cv.userId !== req.user.userId) {
        return res.status(404).json({ message: "Education not found" });
      }

      await prisma.education.delete({ where: { id } });
      await prisma.CV.update({
        where: { id: edu.cv.id },
        data: { updatedAt: new Date() },
      });
      return res.status(200).json({ message: "Education deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
