import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_scheme_scheme" AS ENUM('dd-relay');
  ALTER TYPE "public"."enum_pages_blocks_tiles_items_icon" ADD VALUE 'cube';
  CREATE TABLE "pages_blocks_scheme" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"scheme" "enum_pages_blocks_scheme_scheme" DEFAULT 'dd-relay' NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_scheme" ADD CONSTRAINT "pages_blocks_scheme_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_scheme_order_idx" ON "pages_blocks_scheme" USING btree ("_order");
  CREATE INDEX "pages_blocks_scheme_parent_id_idx" ON "pages_blocks_scheme" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_scheme_path_idx" ON "pages_blocks_scheme" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_scheme" CASCADE;
  ALTER TABLE "pages_blocks_tiles_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_tiles_items" ALTER COLUMN "icon" SET DEFAULT 'scroll'::text;
  DROP TYPE "public"."enum_pages_blocks_tiles_items_icon";
  CREATE TYPE "public"."enum_pages_blocks_tiles_items_icon" AS ENUM('scroll', 'book', 'medal', 'music', 'cap', 'shield', 'pin', 'flag', 'calendar');
  ALTER TABLE "pages_blocks_tiles_items" ALTER COLUMN "icon" SET DEFAULT 'scroll'::"public"."enum_pages_blocks_tiles_items_icon";
  ALTER TABLE "pages_blocks_tiles_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_tiles_items_icon" USING "icon"::"public"."enum_pages_blocks_tiles_items_icon";
  DROP TYPE "public"."enum_pages_blocks_scheme_scheme";`)
}
