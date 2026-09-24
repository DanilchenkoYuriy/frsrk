import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "banners_calendar_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_documents_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_news_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_media_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_sections_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_contacts_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_participants_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banners_about_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_calendar_id_media_id_fk" FOREIGN KEY ("banners_calendar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_documents_id_media_id_fk" FOREIGN KEY ("banners_documents_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_news_id_media_id_fk" FOREIGN KEY ("banners_news_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_media_id_media_id_fk" FOREIGN KEY ("banners_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_sections_id_media_id_fk" FOREIGN KEY ("banners_sections_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_contacts_id_media_id_fk" FOREIGN KEY ("banners_contacts_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_participants_id_media_id_fk" FOREIGN KEY ("banners_participants_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_banners_about_id_media_id_fk" FOREIGN KEY ("banners_about_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_banners_banners_calendar_idx" ON "site_settings" USING btree ("banners_calendar_id");
  CREATE INDEX "site_settings_banners_banners_documents_idx" ON "site_settings" USING btree ("banners_documents_id");
  CREATE INDEX "site_settings_banners_banners_news_idx" ON "site_settings" USING btree ("banners_news_id");
  CREATE INDEX "site_settings_banners_banners_media_idx" ON "site_settings" USING btree ("banners_media_id");
  CREATE INDEX "site_settings_banners_banners_sections_idx" ON "site_settings" USING btree ("banners_sections_id");
  CREATE INDEX "site_settings_banners_banners_contacts_idx" ON "site_settings" USING btree ("banners_contacts_id");
  CREATE INDEX "site_settings_banners_banners_participants_idx" ON "site_settings" USING btree ("banners_participants_id");
  CREATE INDEX "site_settings_banners_banners_about_idx" ON "site_settings" USING btree ("banners_about_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_calendar_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_documents_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_news_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_media_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_sections_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_contacts_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_participants_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_banners_about_id_media_id_fk";
  
  DROP INDEX "site_settings_banners_banners_calendar_idx";
  DROP INDEX "site_settings_banners_banners_documents_idx";
  DROP INDEX "site_settings_banners_banners_news_idx";
  DROP INDEX "site_settings_banners_banners_media_idx";
  DROP INDEX "site_settings_banners_banners_sections_idx";
  DROP INDEX "site_settings_banners_banners_contacts_idx";
  DROP INDEX "site_settings_banners_banners_participants_idx";
  DROP INDEX "site_settings_banners_banners_about_idx";
  ALTER TABLE "site_settings" DROP COLUMN "banners_calendar_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_documents_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_news_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_media_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_sections_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_contacts_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_participants_id";
  ALTER TABLE "site_settings" DROP COLUMN "banners_about_id";`)
}
