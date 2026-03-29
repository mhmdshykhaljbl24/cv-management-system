import { z } from "zod";
import { idParamSchema } from "./common.schema.js";

export const createCvSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    summary: z.string().min(2),
    fullName: z.string().min(2, "Full name is required"),
  }),
});

export const updateCvSchema = idParamSchema.extend({
  body: z.object({
    title: z.string().min(2).optional(),
    summary: z.string().min(2).optional(),
    fullName: z.string().min(2).optional(),
  }),
});

export const fullCvSchema = idParamSchema;
