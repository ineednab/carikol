import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL:     z.string().min(1),
  DIRECT_URL:       z.string().min(1),
  AUTH_SECRET:      z.string().min(1),
  SUMOPOD_API_KEY:  z.string().min(1),
  AUTH_URL:         z.string().url().optional(),
  NODE_ENV:         z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
