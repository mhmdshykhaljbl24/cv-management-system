import { z } from "zod";
import { idParamSchema, cvIdParamSchema } from "./common.schema.js";

export const createExperienceSchema = cvIdParamSchema.extend({
  body: z.object({
    company: z.string().min(2),
    country: z.string().min(2),
    city: z.string().min(2),
    position: z.string().min(2),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
  }),
});

export const updateExperienceSchema = idParamSchema.extend({
  body: z.object({
    company: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    position: z.string().min(2).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
  }),
});

export const experienceIdSchema = idParamSchema;
export const experienceCvIdSchema = cvIdParamSchema;
