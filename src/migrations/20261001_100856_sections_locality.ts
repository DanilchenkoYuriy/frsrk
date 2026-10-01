import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_events_documents_kind" ADD VALUE IF NOT EXISTS 'judge-report' BEFORE 'photo-report';
  ALTER TYPE "public"."enum_events_documents_kind" ADD VALUE IF NOT EXISTS 'security-plan' BEFORE 'photo-report';
  ALTER TYPE "public"."enum_events_documents_kind" ADD VALUE IF NOT EXISTS 'judges-reference' BEFORE 'photo-report';
  ALTER TABLE "site_settings" ALTER COLUMN "inn" SET DEFAULT '9102295198';
  ALTER TABLE "site_settings" ALTER COLUMN "kpp" SET DEFAULT '9102010001';
  ALTER TABLE "site_settings" ALTER COLUMN "accreditation_term" SET DEFAULT 'три года со дня подписания приказа, до 22 апреля 2027 года';
  ALTER TABLE "sections" ADD COLUMN IF NOT EXISTS "locality" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_documents" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_documents_kind";
  CREATE TYPE "public"."enum_events_documents_kind" AS ENUM('regulation', 'rules', 'invitation', 'start-protocol', 'final-protocol', 'photo-report', 'other');
  ALTER TABLE "events_documents" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_events_documents_kind" USING "kind"::"public"."enum_events_documents_kind";
  ALTER TABLE "site_settings" ALTER COLUMN "inn" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "kpp" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "accreditation_term" SET DEFAULT 'три года со дня подписания приказа';
  ALTER TABLE "sections" DROP COLUMN "locality";`)
}
