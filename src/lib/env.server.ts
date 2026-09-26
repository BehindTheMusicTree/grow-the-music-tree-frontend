import { z } from "zod";
import { formatIssues } from "@lib/env";

const ServerEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT: z.string().min(1),
  NEXT_PUBLIC_GROW_BACKEND_BASE_URL: z.string().url().optional(),
});

let cached: z.infer<typeof ServerEnvSchema> | undefined;

// Lazy so `next build` (page-data collection imports auth.ts) doesn't need runtime secrets;
// instrumentation.ts calls this at server boot to fail fast.
export function getServerEnv() {
  if (cached) return cached;
  const parsed = ServerEnvSchema.safeParse({
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT: process.env.NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT,
    NEXT_PUBLIC_GROW_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_GROW_BACKEND_BASE_URL || undefined,
  });
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${formatIssues(parsed.error)}`);
  }
  cached = parsed.data;
  return cached;
}
