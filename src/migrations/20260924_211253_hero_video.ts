import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_hero_mode" AS ENUM('photo', 'video');
  ALTER TABLE "videos" ADD COLUMN "in_gallery" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "hero_mode" "enum_site_settings_hero_mode" DEFAULT 'photo';
  ALTER TABLE "site_settings" ADD COLUMN "hero_video_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_video_mobile" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_video_id_videos_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_hero_video_idx" ON "site_settings" USING btree ("hero_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_video_id_videos_id_fk";
  
  DROP INDEX "site_settings_hero_video_idx";
  ALTER TABLE "videos" DROP COLUMN "in_gallery";
  ALTER TABLE "site_settings" DROP COLUMN "hero_mode";
  ALTER TABLE "site_settings" DROP COLUMN "hero_video_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_video_mobile";
  DROP TYPE "public"."enum_site_settings_hero_mode";`)
}
