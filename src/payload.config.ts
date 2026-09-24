import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import type { CollectionConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { ru } from "@payloadcms/translations/languages/ru";
import sharp from "sharp";

import { allowedOrigins, env, hasS3 } from "@/lib/env";
import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Documents } from "@/collections/Documents";
import { AudioTracks } from "@/collections/AudioTracks";
import { Videos } from "@/collections/Videos";
import { News } from "@/collections/News";
import { Events } from "@/collections/Events";
import { Municipalities } from "@/collections/Municipalities";
import { Sections } from "@/collections/Sections";
import { People } from "@/collections/People";
import { Pages } from "@/collections/Pages";
import { Galleries } from "@/collections/Galleries";
import { RankingEntries } from "@/collections/RankingEntries";
import { Inquiries } from "@/collections/Inquiries";
import { SiteSettings } from "@/globals/SiteSettings";
import { migrations } from "@/migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Без S3 (только разработка на своём компьютере) файлы лежат в папке storage/. */
const withLocalStorage = (collection: CollectionConfig): CollectionConfig => {
  if (hasS3 || !collection.upload) return collection;
  const upload = typeof collection.upload === "object" ? collection.upload : {};
  return {
    ...collection,
    upload: { ...upload, staticDir: path.resolve(dirname, "..", "storage", collection.slug) },
  };
};

const collections = [Users, Media, Documents, AudioTracks, Videos, News, Events, Municipalities, Sections, People, Pages, Galleries, RankingEntries, Inquiries].map(
  withLocalStorage,
);

/** Публичная ссылка на файл: {S3_PUBLIC_URL}/{папка}/{имя файла} — отдаёт хранилище напрямую, без нагрузки на сайт. */
const s3Collection = (prefix: string) => ({
  prefix,
  disablePayloadAccessControl: true as const,
  generateFileURL: ({ filename, prefix: p }: { filename: string; prefix?: string }) =>
    `${env.S3_PUBLIC_URL}/${p ? `${p}/` : ""}${filename}`,
});

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  secret: env.PAYLOAD_SECRET,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  graphQL: { disable: true },
  admin: {
    user: Users.slug,
    dateFormat: "dd.MM.yyyy HH:mm",
    meta: {
      titleSuffix: " — админка ФРСРК",
      description: "Панель управления сайтом ФРСРК",
    },
    components: {
      graphics: {
        Logo: "@/components/admin/AdminLogo#AdminLogo",
        Icon: "@/components/admin/AdminIcon#AdminIcon",
      },
    },
  },
  i18n: { supportedLanguages: { ru }, fallbackLanguage: "ru" },
  editor: lexicalEditor(),
  collections,
  globals: [SiteSettings],
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
      max: 10,
      ssl: env.DATABASE_SSL === "true" ? true : env.DATABASE_SSL === "no-verify" ? { rejectUnauthorized: false } : undefined,
    },
    prodMigrations: migrations,
    push: false,
  }),
  upload: { limits: { fileSize: 250 * 1024 * 1024 } },
  email: env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: env.SMTP_FROM ?? env.SMTP_USER ?? "no-reply@localhost",
        defaultFromName: "Сайт ФРСРК",
        transportOptions: {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT ?? 465,
          secure: (env.SMTP_PORT ?? 465) === 465,
          auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
        },
      })
    : undefined,
  plugins: hasS3
    ? [
        s3Storage({
          collections: {
            media: s3Collection("media"),
            documents: s3Collection("documents"),
            "audio-tracks": s3Collection("audio"),
            videos: s3Collection("videos"),
          },
          bucket: env.S3_BUCKET!,
          config: {
            endpoint: env.S3_ENDPOINT,
            region: env.S3_REGION ?? "ru-1",
            forcePathStyle: true,
            credentials: {
              accessKeyId: env.S3_ACCESS_KEY_ID!,
              secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
            },
          },
        }),
      ]
    : [],
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
