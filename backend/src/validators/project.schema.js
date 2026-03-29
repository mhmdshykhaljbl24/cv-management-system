import { z } from "zod";
import { idParamSchema, cvIdParamSchema } from "./common.schema.js";

const emptyToUndefined = (value) => {
  if (typeof value !== "string") return value;
  const v = value.trim();
  return v === "" ? undefined : v;
};

export const createProjectSchema = cvIdParamSchema.extend({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters"),

    link: z
      .string()
      .trim()
      .url("Link must be a valid URL")
      .optional()
      .or(z.literal("")),

    description: z
      .preprocess(
        emptyToUndefined,
        z.string().trim().min(2, "Description must be at least 2 characters"),
      )
      .optional(),
  }),
});

export const updateProjectSchema = idParamSchema.extend({
  body: z.object({
    name: z.preprocess(emptyToUndefined, z.string().trim().min(2)).optional(),
    link: z.preprocess(emptyToUndefined, z.string().trim().url()).optional(),
    description: z
      .preprocess(emptyToUndefined, z.string().trim().min(2))
      .optional(),
  }),
});

export const projectIdSchema = idParamSchema;
export const projectCvIdSchema = cvIdParamSchema;
