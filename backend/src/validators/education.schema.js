import { z } from "zod";
import { cvIdParamSchema, idParamSchema } from "./common.schema.js";

export const createEducationSchema = cvIdParamSchema.extend({
  body: z.object({
    university: z.string().min(2),
    country: z.string().min(2),
    city: z.string().min(2),
    degree: z.string().min(2),
    major: z.string().min(2),
    gpa: z.coerce.number().optional().nullable(),
    graduationYear: z.coerce.number().int().optional().nullable(),
  }),
});

export const updateEducationSchema = idParamSchema.extend({
  body: z.object({
    university: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    degree: z.string().min(2).optional(),
    major: z.string().min(2).optional(),
    gpa: z.coerce.number().optional().nullable(),
    graduationYear: z.coerce.number().int().optional().nullable(),
  }),
});
