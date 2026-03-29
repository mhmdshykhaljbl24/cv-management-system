import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const cvIdParamSchema = z.object({
  params: z.object({
    cvId: z.coerce.number().int().positive(),
  }),
});
