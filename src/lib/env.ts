import { z } from "zod";

const sampleRate = (fallback: number) => z.coerce.number().min(0).max(1).default(fallback);

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),
  NEXT_PUBLIC_AUDIOMETA_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_IS_ACTIVE: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: sampleRate(0.1),
  NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE: sampleRate(0.1),
  NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE: sampleRate(1.0),
});

// Each var is referenced literally: Next only inlines `process.env.NEXT_PUBLIC_*` into client
// bundles when the full name appears in source.
const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_AUDIOMETA_URL: process.env.NEXT_PUBLIC_AUDIOMETA_URL || undefined,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  NEXT_PUBLIC_SENTRY_IS_ACTIVE: process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE || undefined,
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || undefined,
  NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE || undefined,
  NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE || undefined,
});

if (!parsed.success) {
  throw new Error(`Invalid public environment variables:\n${formatIssues(parsed.error)}`);
}

export const publicEnv = parsed.data;

export function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
}
