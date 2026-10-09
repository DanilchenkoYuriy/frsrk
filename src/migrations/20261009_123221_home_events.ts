import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_layout_home_events_mode" AS ENUM('auto', 'manual');
  CREATE TABLE "site_layout_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer
  );
  
  ALTER TABLE "site_layout" ADD COLUMN "home_events_title" varchar;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_mode" "enum_site_layout_home_events_mode" DEFAULT 'auto';
  ALTER TABLE "site_layout" ADD COLUMN "home_events_featured_id" integer;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_recent_id" integer;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_image_id" integer;
  ALTER TABLE "site_layout_rels" ADD CONSTRAINT "site_layout_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_rels" ADD CONSTRAINT "site_layout_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_layout_rels_order_idx" ON "site_layout_rels" USING btree ("order");
  CREATE INDEX "site_layout_rels_parent_idx" ON "site_layout_rels" USING btree ("parent_id");
  CREATE INDEX "site_layout_rels_path_idx" ON "site_layout_rels" USING btree ("path");
  CREATE INDEX "site_layout_rels_events_id_idx" ON "site_layout_rels" USING btree ("events_id");
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_featured_id_events_id_fk" FOREIGN KEY ("home_events_featured_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_recent_id_events_id_fk" FOREIGN KEY ("home_events_recent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_image_id_media_id_fk" FOREIGN KEY ("home_events_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_layout_home_events_home_events_featured_idx" ON "site_layout" USING btree ("home_events_featured_id");
  CREATE INDEX "site_layout_home_events_home_events_recent_idx" ON "site_layout" USING btree ("home_events_recent_id");
  CREATE INDEX "site_layout_home_events_home_events_image_idx" ON "site_layout" USING btree ("home_events_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_layout_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_layout_rels" CASCADE;
  ALTER TABLE "site_layout" DROP CONSTRAINT "site_layout_home_events_featured_id_events_id_fk";
  
  ALTER TABLE "site_layout" DROP CONSTRAINT "site_layout_home_events_recent_id_events_id_fk";
  
  ALTER TABLE "site_layout" DROP CONSTRAINT "site_layout_home_events_image_id_media_id_fk";
  
  DROP INDEX "site_layout_home_events_home_events_featured_idx";
  DROP INDEX "site_layout_home_events_home_events_recent_idx";
  DROP INDEX "site_layout_home_events_home_events_image_idx";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_title";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_mode";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_featured_id";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_recent_id";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_image_id";
  DROP TYPE "public"."enum_site_layout_home_events_mode";`)
}
