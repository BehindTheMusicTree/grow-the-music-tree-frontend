import { z } from "zod";
import { formatIssues } from "@lib/env";

const ServerEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  GROW_API_ORIGIN: z
    .string()
    .url()
    .refine((value) => URL.canParse(value) && new URL(value).pathname === "/", "must be an origin without a path")
    .transform((value) => new URL(value).origin),
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
    GROW_API_ORIGIN: process.env.GROW_API_ORIGIN,
  });
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${formatIssues(parsed.error)}`);
  }
  cached = parsed.data;
  return cached;
}
