import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_site_layout_socials_network" ADD VALUE 'max' BEFORE 'youtube';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_layout_socials" ALTER COLUMN "network" SET DATA TYPE text;
  ALTER TABLE "site_layout_socials" ALTER COLUMN "network" SET DEFAULT 'vk'::text;
  DROP TYPE "public"."enum_site_layout_socials_network";
  CREATE TYPE "public"."enum_site_layout_socials_network" AS ENUM('vk', 'telegram', 'youtube', 'other');
  ALTER TABLE "site_layout_socials" ALTER COLUMN "network" SET DEFAULT 'vk'::"public"."enum_site_layout_socials_network";
  ALTER TABLE "site_layout_socials" ALTER COLUMN "network" SET DATA TYPE "public"."enum_site_layout_socials_network" USING "network"::"public"."enum_site_layout_socials_network";`)
}
