import { z } from "zod";

export const ErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  success: z.boolean(),
  details: z.object({
    code: z.string(),
    fieldErrors: z
      .record(
        z.string(),
        z.array(
          z.object({
            code: z.string(),
            message: z.string(),
          })
        )
      )
      .optional(),
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
