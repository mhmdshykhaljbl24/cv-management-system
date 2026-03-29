import { z } from "zod";
import { idParamSchema, cvIdParamSchema } from "./common.schema.js";

export const createSkillSchema = cvIdParamSchema.extend({
  body: z.object({
    name: z.string().min(1),
    level: z.coerce.number().int().min(0).max(100),
  }),
});

export const updateSkillSchema = idParamSchema.extend({
  body: z.object({
    name: z.string().min(1).optional(),
    level: z.coerce.number().int().min(0).max(100).optional(),
  }),
});

export const skillIdSchema = idParamSchema;
export const skillCvIdSchema = cvIdParamSchema;
