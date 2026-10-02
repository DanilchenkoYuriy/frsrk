import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_jump_stats_discipline" AS ENUM('jumps-30', 'jumps-180', 'freestyle', 'double-jumps', 'triple-jumps', 'jumps-4', 'two-ropes-4', 'freestyle-group', 'two-ropes-1', 'two-ropes-2', 'team');
  CREATE TABLE "events_jump_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"discipline" "enum_events_jump_stats_discipline" NOT NULL,
  	"jumps" numeric NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "jump_stats_note" varchar;
  ALTER TABLE "events_jump_stats" ADD CONSTRAINT "events_jump_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_jump_stats_order_idx" ON "events_jump_stats" USING btree ("_order");
  CREATE INDEX "events_jump_stats_parent_id_idx" ON "events_jump_stats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "events_jump_stats" CASCADE;
  ALTER TABLE "events" DROP COLUMN "jump_stats_note";
  DROP TYPE "public"."enum_events_jump_stats_discipline";`)
}
