import { z } from "zod";

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    overallTotal: z.number(),
    next: z.string().url().optional(),
    previous: z.string().url().optional(),
    results: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export type PaginatedResponse<T> = {
  overallTotal: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page: number;
  pageSize: number;
  totalPages: number;
};
