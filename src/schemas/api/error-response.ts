import { z } from "zod";

export const ErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  success: z.boolean(),
  details: z.object({
    message: z.string(),
    fieldErrors: z.array(
      z.object({
        message: z.string(),
        code: z.string(),
      })
    ),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
