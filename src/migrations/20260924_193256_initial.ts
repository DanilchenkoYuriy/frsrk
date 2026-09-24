import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_documents_category" AS ENUM('federation', 'rules', 'classification', 'regulations', 'education', 'orders', 'antidoping', 'forms');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('current', 'archived');
  CREATE TYPE "public"."enum_events_documents_kind" AS ENUM('regulation', 'rules', 'invitation', 'start-protocol', 'final-protocol', 'photo-report', 'other');
  CREATE TYPE "public"."enum_events_type" AS ENUM('competition', 'festival', 'seminar', 'course', 'camp', 'other');
  CREATE TYPE "public"."enum_events_level" AS ENUM('municipal', 'republic', 'russia', 'international');
  CREATE TYPE "public"."enum_municipalities_kind" AS ENUM('city', 'district', 'federal-city');
  CREATE TYPE "public"."enum_sections_disciplines" AS ENUM('jumps-30', 'jumps-180', 'freestyle', 'double-jumps', 'triple-jumps', 'jumps-4', 'two-ropes-4', 'freestyle-group', 'two-ropes-1', 'two-ropes-2', 'team');
  CREATE TYPE "public"."enum_people_group" AS ENUM('leadership', 'coach', 'judge', 'representative');
  CREATE TYPE "public"."enum_pages_key" AS ENUM('about', 'history', 'parents', 'antidoping', 'rules', 'education-judges', 'education-coaches', 'leadership', 'privacy', 'cookies', 'media');
  CREATE TYPE "public"."enum_ranking_entries_discipline" AS ENUM('jumps-30', 'jumps-180', 'freestyle', 'double-jumps', 'triple-jumps', 'jumps-4', 'two-ropes-4', 'freestyle-group', 'two-ropes-1', 'two-ropes-2', 'team');
  CREATE TYPE "public"."enum_ranking_entries_age_group" AS ENUM('10-11', '12-14', '15-17', '18+');
  CREATE TYPE "public"."enum_ranking_entries_gender" AS ENUM('female', 'male');
  CREATE TYPE "public"."enum_inquiries_topic" AS ENUM('general', 'join-club', 'join-coach', 'join-judge', 'press');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'done');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_documents_category" DEFAULT 'regulations' NOT NULL,
  	"number" varchar,
  	"doc_date" timestamp(3) with time zone,
  	"description" varchar,
  	"status" "enum_documents_status" DEFAULT 'current' NOT NULL,
  	"order" numeric DEFAULT 100,
  	"published" boolean DEFAULT false,
  	"prefix" varchar DEFAULT 'documents',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "audio_tracks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"duration_label" varchar,
  	"order" numeric DEFAULT 100,
  	"published" boolean DEFAULT true,
  	"prefix" varchar DEFAULT 'audio',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"external_url" varchar,
  	"poster_id" integer,
  	"date" timestamp(3) with time zone,
  	"description" varchar,
  	"published" boolean DEFAULT false,
  	"prefix" varchar DEFAULT 'videos',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "news_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"cover_id" integer,
  	"body" jsonb,
  	"event_id" integer,
  	"featured" boolean DEFAULT false,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_events_documents_kind" NOT NULL,
  	"document_id" integer NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"type" "enum_events_type" DEFAULT 'competition' NOT NULL,
  	"level" "enum_events_level" DEFAULT 'republic' NOT NULL,
  	"date_from" timestamp(3) with time zone NOT NULL,
  	"date_to" timestamp(3) with time zone,
  	"municipality_id" integer,
  	"venue" varchar,
  	"description" jsonb,
  	"registration_url" varchar,
  	"registration_deadline" timestamp(3) with time zone,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "municipalities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"kind" "enum_municipalities_kind" NOT NULL,
  	"representative_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sections_disciplines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_sections_disciplines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"municipality_id" integer NOT NULL,
  	"organization" varchar,
  	"address" varchar NOT NULL,
  	"coach" varchar,
  	"age_from" numeric,
  	"age_to" numeric,
  	"schedule" varchar,
  	"is_free" boolean DEFAULT false,
  	"price_note" varchar,
  	"phone" varchar,
  	"messenger_url" varchar,
  	"description" varchar,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"position" varchar NOT NULL,
  	"group" "enum_people_group" DEFAULT 'leadership' NOT NULL,
  	"photo_id" integer,
  	"bio" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"order" numeric DEFAULT 100,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"key" "enum_pages_key" NOT NULL,
  	"lead" varchar,
  	"body" jsonb,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "galleries_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "galleries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"description" varchar,
  	"cover_id" integer,
  	"event_id" integer,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranking_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete" varchar NOT NULL,
  	"season" varchar NOT NULL,
  	"discipline" "enum_ranking_entries_discipline" NOT NULL,
  	"age_group" "enum_ranking_entries_age_group" NOT NULL,
  	"gender" "enum_ranking_entries_gender" NOT NULL,
  	"municipality_id" integer,
  	"club" varchar,
  	"points" numeric NOT NULL,
  	"starts" numeric,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"topic" "enum_inquiries_topic" NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"message" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"audio_tracks_id" integer,
  	"videos_id" integer,
  	"news_id" integer,
  	"events_id" integer,
  	"municipalities_id" integer,
  	"sections_id" integer,
  	"people_id" integer,
  	"pages_id" integer,
  	"galleries_id" integer,
  	"ranking_entries_id" integer,
  	"inquiries_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar DEFAULT 'Федерация роуп скиппинга (спортивной скакалки) Республики Крым' NOT NULL,
  	"short_name" varchar DEFAULT 'ФРСРК' NOT NULL,
  	"legal_name" varchar DEFAULT 'Общественная организация «Федерация роуп скиппинга (спортивной скакалки) Республики Крым»',
  	"description" varchar DEFAULT 'Официальный сайт Федерации роуп скиппинга (спортивной скакалки) Республики Крым: календарь соревнований, секции, документы, новости.',
  	"hero_image_id" integer,
  	"og_image_id" integer,
  	"phone" varchar DEFAULT '+7 978 738-32-46',
  	"email" varchar DEFAULT 'crimea.skipping@mail.ru',
  	"address" varchar DEFAULT '295003, Республика Крым, г. Симферополь, ул. Балаклавская, д. 41, офис 118',
  	"vk" varchar DEFAULT 'https://vk.ru/rope_skipping_crimea',
  	"telegram" varchar DEFAULT 'https://t.me/+3uyHm_gL9wtmNzRi',
  	"ogrn" varchar DEFAULT '1249100003448',
  	"inn" varchar,
  	"kpp" varchar,
  	"bank_details" varchar,
  	"accreditation_order_number" varchar DEFAULT '242-ОД',
  	"accreditation_order_date" timestamp(3) with time zone DEFAULT '2024-04-22T00:00:00.000Z',
  	"accreditation_issued_by" varchar DEFAULT 'Министерство спорта Республики Крым',
  	"accreditation_term" varchar DEFAULT 'три года со дня подписания приказа',
  	"accreditation_vrvs_code" varchar DEFAULT '1780001411Я',
  	"metrika_id" varchar,
  	"notify_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_documents" ADD CONSTRAINT "events_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_documents" ADD CONSTRAINT "events_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_representative_id_people_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sections_disciplines" ADD CONSTRAINT "sections_disciplines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sections" ADD CONSTRAINT "sections_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_photos" ADD CONSTRAINT "galleries_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_photos" ADD CONSTRAINT "galleries_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audio_tracks_fk" FOREIGN KEY ("audio_tracks_id") REFERENCES "public"."audio_tracks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_municipalities_fk" FOREIGN KEY ("municipalities_id") REFERENCES "public"."municipalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sections_fk" FOREIGN KEY ("sections_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_galleries_fk" FOREIGN KEY ("galleries_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ranking_entries_fk" FOREIGN KEY ("ranking_entries_id") REFERENCES "public"."ranking_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "audio_tracks_updated_at_idx" ON "audio_tracks" USING btree ("updated_at");
  CREATE INDEX "audio_tracks_created_at_idx" ON "audio_tracks" USING btree ("created_at");
  CREATE UNIQUE INDEX "audio_tracks_filename_idx" ON "audio_tracks" USING btree ("filename");
  CREATE INDEX "videos_poster_idx" ON "videos" USING btree ("poster_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_filename_idx" ON "videos" USING btree ("filename");
  CREATE INDEX "news_gallery_order_idx" ON "news_gallery" USING btree ("_order");
  CREATE INDEX "news_gallery_parent_id_idx" ON "news_gallery" USING btree ("_parent_id");
  CREATE INDEX "news_gallery_image_idx" ON "news_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_cover_idx" ON "news" USING btree ("cover_id");
  CREATE INDEX "news_event_idx" ON "news" USING btree ("event_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "events_documents_order_idx" ON "events_documents" USING btree ("_order");
  CREATE INDEX "events_documents_parent_id_idx" ON "events_documents" USING btree ("_parent_id");
  CREATE INDEX "events_documents_document_idx" ON "events_documents" USING btree ("document_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_date_from_idx" ON "events" USING btree ("date_from");
  CREATE INDEX "events_municipality_idx" ON "events" USING btree ("municipality_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "municipalities_slug_idx" ON "municipalities" USING btree ("slug");
  CREATE INDEX "municipalities_representative_idx" ON "municipalities" USING btree ("representative_id");
  CREATE INDEX "municipalities_updated_at_idx" ON "municipalities" USING btree ("updated_at");
  CREATE INDEX "municipalities_created_at_idx" ON "municipalities" USING btree ("created_at");
  CREATE INDEX "sections_disciplines_order_idx" ON "sections_disciplines" USING btree ("order");
  CREATE INDEX "sections_disciplines_parent_idx" ON "sections_disciplines" USING btree ("parent_id");
  CREATE INDEX "sections_municipality_idx" ON "sections" USING btree ("municipality_id");
  CREATE INDEX "sections_updated_at_idx" ON "sections" USING btree ("updated_at");
  CREATE INDEX "sections_created_at_idx" ON "sections" USING btree ("created_at");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_key_idx" ON "pages" USING btree ("key");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "galleries_photos_order_idx" ON "galleries_photos" USING btree ("_order");
  CREATE INDEX "galleries_photos_parent_id_idx" ON "galleries_photos" USING btree ("_parent_id");
  CREATE INDEX "galleries_photos_image_idx" ON "galleries_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "galleries_slug_idx" ON "galleries" USING btree ("slug");
  CREATE INDEX "galleries_cover_idx" ON "galleries" USING btree ("cover_id");
  CREATE INDEX "galleries_event_idx" ON "galleries" USING btree ("event_id");
  CREATE INDEX "galleries_updated_at_idx" ON "galleries" USING btree ("updated_at");
  CREATE INDEX "galleries_created_at_idx" ON "galleries" USING btree ("created_at");
  CREATE INDEX "ranking_entries_season_idx" ON "ranking_entries" USING btree ("season");
  CREATE INDEX "ranking_entries_municipality_idx" ON "ranking_entries" USING btree ("municipality_id");
  CREATE INDEX "ranking_entries_updated_at_idx" ON "ranking_entries" USING btree ("updated_at");
  CREATE INDEX "ranking_entries_created_at_idx" ON "ranking_entries" USING btree ("created_at");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_audio_tracks_id_idx" ON "payload_locked_documents_rels" USING btree ("audio_tracks_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_municipalities_id_idx" ON "payload_locked_documents_rels" USING btree ("municipalities_id");
  CREATE INDEX "payload_locked_documents_rels_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("sections_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_galleries_id_idx" ON "payload_locked_documents_rels" USING btree ("galleries_id");
  CREATE INDEX "payload_locked_documents_rels_ranking_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("ranking_entries_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_hero_image_idx" ON "site_settings" USING btree ("hero_image_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "audio_tracks" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "news_gallery" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "events_documents" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "municipalities" CASCADE;
  DROP TABLE "sections_disciplines" CASCADE;
  DROP TABLE "sections" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "galleries_photos" CASCADE;
  DROP TABLE "galleries" CASCADE;
  DROP TABLE "ranking_entries" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_documents_category";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum_events_documents_kind";
  DROP TYPE "public"."enum_events_type";
  DROP TYPE "public"."enum_events_level";
  DROP TYPE "public"."enum_municipalities_kind";
  DROP TYPE "public"."enum_sections_disciplines";
  DROP TYPE "public"."enum_people_group";
  DROP TYPE "public"."enum_pages_key";
  DROP TYPE "public"."enum_ranking_entries_discipline";
  DROP TYPE "public"."enum_ranking_entries_age_group";
  DROP TYPE "public"."enum_ranking_entries_gender";
  DROP TYPE "public"."enum_inquiries_topic";
  DROP TYPE "public"."enum_inquiries_status";`)
}
