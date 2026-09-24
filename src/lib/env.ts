import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "Не задан DATABASE_URL"),
  /** true - шифровать соединение; no-verify - шифровать без проверки сертификата (если база на хостинге отвечает ошибкой SSL) */
  DATABASE_SSL: z.enum(["true", "no-verify", "false"]).optional(),
  PAYLOAD_SECRET: z.string().min(32, "PAYLOAD_SECRET должен быть не короче 32 символов"),
  /** Дополнительные адреса сайта через запятую (например, версия с www), которым разрешён вход в админку */
  EXTRA_ORIGINS: z.string().optional(),
  /** Код подтверждения сайта в Яндекс.Вебмастере */
  YANDEX_VERIFICATION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Ошибка настроек окружения (.env): ${details}`);
}

export const env = parsed.data;

export const hasS3 = Boolean(env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_PUBLIC_URL);

export const allowedOrigins = [env.NEXT_PUBLIC_SITE_URL, ...(env.EXTRA_ORIGINS?.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean) ?? [])];
