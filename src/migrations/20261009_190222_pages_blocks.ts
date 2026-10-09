import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { moveData, readOld } from './data/20261009_pages_blocks'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Сначала читаем всё старое: меню, разделы, тексты, настройки первого экрана — схема ниже их удалит
  const old = await readOld(db)

  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_buttons_link_type" AS ENUM('page', 'route', 'url');
  CREATE TYPE "public"."enum_pages_blocks_hero_buttons_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_pages_blocks_hero_buttons_style" AS ENUM('red', 'light');
  CREATE TYPE "public"."enum_pages_blocks_hero_mode" AS ENUM('photo', 'video');
  CREATE TYPE "public"."enum_pages_blocks_text_image_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_people_group" AS ENUM('leadership', 'coach', 'judge', 'representative');
  CREATE TYPE "public"."enum_pages_blocks_events_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_tiles_items_icon" AS ENUM('scroll', 'book', 'medal', 'music', 'cap', 'shield', 'pin', 'flag', 'calendar');
  CREATE TYPE "public"."enum_pages_blocks_tiles_items_link_type" AS ENUM('page', 'route', 'url');
  CREATE TYPE "public"."enum_pages_blocks_tiles_items_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_pages_blocks_tiles_more_link_type" AS ENUM('page', 'route', 'url');
  CREATE TYPE "public"."enum_pages_blocks_tiles_more_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_pages_blocks_contact_band_button_link_type" AS ENUM('page', 'route', 'url');
  CREATE TYPE "public"."enum_pages_blocks_contact_band_button_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('custom', 'home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'contacts', 'sections', 'privacy', 'cookies');
  CREATE TABLE "pages_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_pages_blocks_hero_buttons_link_type" DEFAULT 'page',
  	"link_route" "enum_pages_blocks_hero_buttons_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"style" "enum_pages_blocks_hero_buttons_style" DEFAULT 'red'
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"mode" "enum_pages_blocks_hero_mode" DEFAULT 'photo',
  	"image_id" integer,
  	"video_id" integer,
  	"video_mobile" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"content" jsonb NOT NULL,
  	"image_id" integer NOT NULL,
  	"image_side" "enum_pages_blocks_text_image_image_side" DEFAULT 'right',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"group" "enum_pages_blocks_people_group" NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar DEFAULT 'Календарь',
  	"title" varchar DEFAULT 'Ближайшие мероприятия',
  	"mode" "enum_pages_blocks_events_mode" DEFAULT 'auto',
  	"featured_id" integer,
  	"recent_id" integer,
  	"image_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sections_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar DEFAULT 'Где заниматься',
  	"title" varchar DEFAULT 'Найдите секцию рядом с домом',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar DEFAULT 'Новости',
  	"title" varchar DEFAULT 'Что нового в федерации',
  	"count" numeric DEFAULT 3,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar DEFAULT 'Медиа',
  	"title" varchar DEFAULT 'Как это выглядит',
  	"gallery_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tiles_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_tiles_items_icon" DEFAULT 'scroll',
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"link_type" "enum_pages_blocks_tiles_items_link_type" DEFAULT 'page',
  	"link_route" "enum_pages_blocks_tiles_items_link_route",
  	"link_page_id" integer,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"more_label" varchar,
  	"more_link_type" "enum_pages_blocks_tiles_more_link_type" DEFAULT 'page',
  	"more_link_route" "enum_pages_blocks_tiles_more_link_route",
  	"more_link_page_id" integer,
  	"more_link_url" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Остались вопросы?',
  	"text" varchar,
  	"button_label" varchar DEFAULT 'Написать в федерацию',
  	"button_link_type" "enum_pages_blocks_contact_band_button_link_type" DEFAULT 'page',
  	"button_link_route" "enum_pages_blocks_contact_band_button_link_route",
  	"button_link_page_id" integer,
  	"button_link_url" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_builtin" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_menu_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_tabs" CASCADE;
  DROP TABLE "site_sections_items" CASCADE;
  DROP TABLE "site_sections" CASCADE;
  DROP TABLE "site_layout_menu_children" CASCADE;
  DROP TABLE "site_layout_menu" CASCADE;
  DROP TABLE "site_layout_rels" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_section_id_site_sections_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_site_sections_fk";
  
  ALTER TABLE "site_layout" DROP CONSTRAINT IF EXISTS "site_layout_home_events_featured_id_events_id_fk";
  
  ALTER TABLE "site_layout" DROP CONSTRAINT IF EXISTS "site_layout_home_events_recent_id_events_id_fk";
  
  ALTER TABLE "site_layout" DROP CONSTRAINT IF EXISTS "site_layout_home_events_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_hero_video_id_videos_id_fk";
  
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DEFAULT 'page'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_link_type";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_link_type" AS ENUM('page', 'route', 'url');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DEFAULT 'page'::"public"."enum_pages_blocks_buttons_buttons_link_type";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_link_type" USING "link_type"::"public"."enum_pages_blocks_buttons_buttons_link_type";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'line'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('line', 'red');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'line'::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_style" USING "style"::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'page'::text;
  DROP TYPE "public"."enum_site_layout_footer_columns_links_link_type";
  CREATE TYPE "public"."enum_site_layout_footer_columns_links_link_type" AS ENUM('page', 'route', 'url');
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'page'::"public"."enum_site_layout_footer_columns_links_link_type";
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_site_layout_footer_columns_links_link_type" USING "link_type"::"public"."enum_site_layout_footer_columns_links_link_type";
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DATA TYPE text;
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DEFAULT 'page'::text;
  DROP TYPE "public"."enum_site_layout_cta_link_type";
  CREATE TYPE "public"."enum_site_layout_cta_link_type" AS ENUM('page', 'route', 'url');
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DEFAULT 'page'::"public"."enum_site_layout_cta_link_type";
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DATA TYPE "public"."enum_site_layout_cta_link_type" USING "cta_link_type"::"public"."enum_site_layout_cta_link_type";
  DROP INDEX IF EXISTS "pages_key_idx";
  DROP INDEX IF EXISTS "pages_section_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_site_sections_id_idx";
  DROP INDEX IF EXISTS "site_layout_home_events_home_events_featured_idx";
  DROP INDEX IF EXISTS "site_layout_home_events_home_events_recent_idx";
  DROP INDEX IF EXISTS "site_layout_home_events_home_events_image_idx";
  DROP INDEX IF EXISTS "site_settings_hero_video_idx";
  ALTER TABLE "pages_blocks_text" ADD COLUMN "split_tabs" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_text" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_buttons" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "_order" varchar;
  ALTER TABLE "pages" ADD COLUMN "banner_id" integer;
  ALTER TABLE "pages" ADD COLUMN "slogan" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "menu_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "kind" "enum_pages_kind" DEFAULT 'custom';
  ALTER TABLE "pages" ADD COLUMN "parent_id" integer;
  ALTER TABLE "pages" ADD COLUMN "show_in_menu" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "dropdown" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "also_in_top_menu" boolean DEFAULT false;
  ALTER TABLE "pages_rels" ADD COLUMN "videos_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "pages_blocks_hero_buttons" ADD CONSTRAINT "pages_blocks_hero_buttons_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_buttons" ADD CONSTRAINT "pages_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_image" ADD CONSTRAINT "pages_blocks_text_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_image" ADD CONSTRAINT "pages_blocks_text_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links_items" ADD CONSTRAINT "pages_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links" ADD CONSTRAINT "pages_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_people" ADD CONSTRAINT "pages_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_tabs" ADD CONSTRAINT "pages_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs" ADD CONSTRAINT "pages_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_events" ADD CONSTRAINT "pages_blocks_events_featured_id_events_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_events" ADD CONSTRAINT "pages_blocks_events_recent_id_events_id_fk" FOREIGN KEY ("recent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_events" ADD CONSTRAINT "pages_blocks_events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_events" ADD CONSTRAINT "pages_blocks_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sections_map" ADD CONSTRAINT "pages_blocks_sections_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_news" ADD CONSTRAINT "pages_blocks_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tiles_items" ADD CONSTRAINT "pages_blocks_tiles_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tiles_items" ADD CONSTRAINT "pages_blocks_tiles_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tiles" ADD CONSTRAINT "pages_blocks_tiles_more_link_page_id_pages_id_fk" FOREIGN KEY ("more_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tiles" ADD CONSTRAINT "pages_blocks_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_band" ADD CONSTRAINT "pages_blocks_contact_band_button_link_page_id_pages_id_fk" FOREIGN KEY ("button_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_band" ADD CONSTRAINT "pages_blocks_contact_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_builtin" ADD CONSTRAINT "pages_blocks_builtin_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_buttons_order_idx" ON "pages_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_buttons_parent_id_idx" ON "pages_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_buttons_link_link_page_idx" ON "pages_blocks_hero_buttons" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_video_idx" ON "pages_blocks_hero" USING btree ("video_id");
  CREATE INDEX "pages_blocks_text_image_order_idx" ON "pages_blocks_text_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_image_parent_id_idx" ON "pages_blocks_text_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_image_path_idx" ON "pages_blocks_text_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_image_image_idx" ON "pages_blocks_text_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_links_items_order_idx" ON "pages_blocks_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_items_parent_id_idx" ON "pages_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_order_idx" ON "pages_blocks_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_parent_id_idx" ON "pages_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_path_idx" ON "pages_blocks_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_people_order_idx" ON "pages_blocks_people" USING btree ("_order");
  CREATE INDEX "pages_blocks_people_parent_id_idx" ON "pages_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_people_path_idx" ON "pages_blocks_people" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_tabs_tabs_order_idx" ON "pages_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_tabs_parent_id_idx" ON "pages_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_order_idx" ON "pages_blocks_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_parent_id_idx" ON "pages_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_path_idx" ON "pages_blocks_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_events_order_idx" ON "pages_blocks_events" USING btree ("_order");
  CREATE INDEX "pages_blocks_events_parent_id_idx" ON "pages_blocks_events" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_events_path_idx" ON "pages_blocks_events" USING btree ("_path");
  CREATE INDEX "pages_blocks_events_featured_idx" ON "pages_blocks_events" USING btree ("featured_id");
  CREATE INDEX "pages_blocks_events_recent_idx" ON "pages_blocks_events" USING btree ("recent_id");
  CREATE INDEX "pages_blocks_events_image_idx" ON "pages_blocks_events" USING btree ("image_id");
  CREATE INDEX "pages_blocks_sections_map_order_idx" ON "pages_blocks_sections_map" USING btree ("_order");
  CREATE INDEX "pages_blocks_sections_map_parent_id_idx" ON "pages_blocks_sections_map" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sections_map_path_idx" ON "pages_blocks_sections_map" USING btree ("_path");
  CREATE INDEX "pages_blocks_news_order_idx" ON "pages_blocks_news" USING btree ("_order");
  CREATE INDEX "pages_blocks_news_parent_id_idx" ON "pages_blocks_news" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_news_path_idx" ON "pages_blocks_news" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_gallery_idx" ON "pages_blocks_gallery" USING btree ("gallery_id");
  CREATE INDEX "pages_blocks_tiles_items_order_idx" ON "pages_blocks_tiles_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tiles_items_parent_id_idx" ON "pages_blocks_tiles_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tiles_items_link_link_page_idx" ON "pages_blocks_tiles_items" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_tiles_order_idx" ON "pages_blocks_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_tiles_parent_id_idx" ON "pages_blocks_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tiles_path_idx" ON "pages_blocks_tiles" USING btree ("_path");
  CREATE INDEX "pages_blocks_tiles_more_link_more_link_page_idx" ON "pages_blocks_tiles" USING btree ("more_link_page_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_band_order_idx" ON "pages_blocks_contact_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_band_parent_id_idx" ON "pages_blocks_contact_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_band_path_idx" ON "pages_blocks_contact_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_band_button_link_button_link_page_idx" ON "pages_blocks_contact_band" USING btree ("button_link_page_id");
  CREATE INDEX "pages_blocks_builtin_order_idx" ON "pages_blocks_builtin" USING btree ("_order");
  CREATE INDEX "pages_blocks_builtin_parent_id_idx" ON "pages_blocks_builtin" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_builtin_path_idx" ON "pages_blocks_builtin" USING btree ("_path");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages__order_idx" ON "pages" USING btree ("_order");
  CREATE INDEX "pages_banner_idx" ON "pages" USING btree ("banner_id");
  CREATE INDEX "pages_kind_idx" ON "pages" USING btree ("kind");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_rels_videos_id_idx" ON "pages_rels" USING btree ("videos_id");
  CREATE INDEX "pages_rels_events_id_idx" ON "pages_rels" USING btree ("events_id");
  ALTER TABLE "pages" DROP COLUMN "key";
  ALTER TABLE "pages" DROP COLUMN "section_id";
  ALTER TABLE "pages" DROP COLUMN "body";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_sections_id";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_title";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_mode";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_featured_id";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_recent_id";
  ALTER TABLE "site_layout" DROP COLUMN "home_events_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_title";
  ALTER TABLE "site_settings" DROP COLUMN "hero_lead";
  ALTER TABLE "site_settings" DROP COLUMN "hero_mode";
  ALTER TABLE "site_settings" DROP COLUMN "hero_video_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_video_mobile";
  DROP TYPE "public"."enum_pages_key";
  DROP TYPE "public"."enum_site_sections_items_link_type";
  DROP TYPE "public"."enum_site_sections_items_link_route";
  DROP TYPE "public"."enum_site_layout_menu_children_link_type";
  DROP TYPE "public"."enum_site_layout_menu_children_link_route";
  DROP TYPE "public"."enum_site_layout_menu_link_type";
  DROP TYPE "public"."enum_site_layout_menu_link_route";
  DROP TYPE "public"."enum_site_layout_home_events_mode";
  DROP TYPE "public"."enum_site_settings_hero_mode";`)

  await moveData({ db, payload, req, old })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_key" AS ENUM('about', 'history', 'parents', 'antidoping', 'rules', 'education-judges', 'education-coaches', 'leadership', 'privacy', 'cookies', 'media');
  CREATE TYPE "public"."enum_site_sections_items_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_sections_items_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_menu_children_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_menu_children_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_menu_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_menu_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_home_events_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_site_settings_hero_mode" AS ENUM('photo', 'video');
  CREATE TABLE "pages_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_site_sections_items_link_type" DEFAULT 'route',
  	"link_route" "enum_site_sections_items_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"banner_id" integer,
  	"slogan" varchar,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_layout_menu_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_site_layout_menu_children_link_type" DEFAULT 'route',
  	"link_route" "enum_site_layout_menu_children_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_layout_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_site_layout_menu_link_type" DEFAULT 'route',
  	"link_route" "enum_site_layout_menu_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_layout_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer
  );
  
  ALTER TABLE "pages_blocks_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sections_map" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_news" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tiles_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_builtin" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_buttons" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_text_image" CASCADE;
  DROP TABLE "pages_blocks_links_items" CASCADE;
  DROP TABLE "pages_blocks_links" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_people" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_tabs" CASCADE;
  DROP TABLE "pages_blocks_events" CASCADE;
  DROP TABLE "pages_blocks_sections_map" CASCADE;
  DROP TABLE "pages_blocks_news" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_tiles_items" CASCADE;
  DROP TABLE "pages_blocks_tiles" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_contact_band" CASCADE;
  DROP TABLE "pages_blocks_builtin" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_banner_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_videos_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_events_fk";
  
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DEFAULT 'route'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_link_type";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_link_type" AS ENUM('route', 'page', 'url');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DEFAULT 'route'::"public"."enum_pages_blocks_buttons_buttons_link_type";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_link_type" USING "link_type"::"public"."enum_pages_blocks_buttons_buttons_link_type";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'line'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('red', 'line');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'line'::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_style" USING "style"::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'route'::text;
  DROP TYPE "public"."enum_site_layout_footer_columns_links_link_type";
  CREATE TYPE "public"."enum_site_layout_footer_columns_links_link_type" AS ENUM('route', 'page', 'url');
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'route'::"public"."enum_site_layout_footer_columns_links_link_type";
  ALTER TABLE "site_layout_footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_site_layout_footer_columns_links_link_type" USING "link_type"::"public"."enum_site_layout_footer_columns_links_link_type";
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DATA TYPE text;
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DEFAULT 'route'::text;
  DROP TYPE "public"."enum_site_layout_cta_link_type";
  CREATE TYPE "public"."enum_site_layout_cta_link_type" AS ENUM('route', 'page', 'url');
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DEFAULT 'route'::"public"."enum_site_layout_cta_link_type";
  ALTER TABLE "site_layout" ALTER COLUMN "cta_link_type" SET DATA TYPE "public"."enum_site_layout_cta_link_type" USING "cta_link_type"::"public"."enum_site_layout_cta_link_type";
  DROP INDEX "pages__order_idx";
  DROP INDEX "pages_banner_idx";
  DROP INDEX "pages_kind_idx";
  DROP INDEX "pages_parent_idx";
  DROP INDEX "pages_rels_videos_id_idx";
  DROP INDEX "pages_rels_events_id_idx";
  ALTER TABLE "pages" ADD COLUMN "key" "enum_pages_key";
  ALTER TABLE "pages" ADD COLUMN "section_id" integer;
  ALTER TABLE "pages" ADD COLUMN "body" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_sections_id" integer;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_title" varchar;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_mode" "enum_site_layout_home_events_mode" DEFAULT 'auto';
  ALTER TABLE "site_layout" ADD COLUMN "home_events_featured_id" integer;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_recent_id" integer;
  ALTER TABLE "site_layout" ADD COLUMN "home_events_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "hero_lead" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "hero_mode" "enum_site_settings_hero_mode" DEFAULT 'photo';
  ALTER TABLE "site_settings" ADD COLUMN "hero_video_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_video_mobile" boolean DEFAULT false;
  ALTER TABLE "pages_tabs" ADD CONSTRAINT "pages_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_sections_items" ADD CONSTRAINT "site_sections_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_sections_items" ADD CONSTRAINT "site_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_sections" ADD CONSTRAINT "site_sections_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu_children" ADD CONSTRAINT "site_layout_menu_children_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu_children" ADD CONSTRAINT "site_layout_menu_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_menu" ADD CONSTRAINT "site_layout_menu_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu" ADD CONSTRAINT "site_layout_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_rels" ADD CONSTRAINT "site_layout_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_rels" ADD CONSTRAINT "site_layout_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_tabs_order_idx" ON "pages_tabs" USING btree ("_order");
  CREATE INDEX "pages_tabs_parent_id_idx" ON "pages_tabs" USING btree ("_parent_id");
  CREATE INDEX "site_sections_items_order_idx" ON "site_sections_items" USING btree ("_order");
  CREATE INDEX "site_sections_items_parent_id_idx" ON "site_sections_items" USING btree ("_parent_id");
  CREATE INDEX "site_sections_items_link_link_page_idx" ON "site_sections_items" USING btree ("link_page_id");
  CREATE UNIQUE INDEX "site_sections_slug_idx" ON "site_sections" USING btree ("slug");
  CREATE INDEX "site_sections_banner_idx" ON "site_sections" USING btree ("banner_id");
  CREATE INDEX "site_sections_updated_at_idx" ON "site_sections" USING btree ("updated_at");
  CREATE INDEX "site_sections_created_at_idx" ON "site_sections" USING btree ("created_at");
  CREATE INDEX "site_layout_menu_children_order_idx" ON "site_layout_menu_children" USING btree ("_order");
  CREATE INDEX "site_layout_menu_children_parent_id_idx" ON "site_layout_menu_children" USING btree ("_parent_id");
  CREATE INDEX "site_layout_menu_children_link_link_page_idx" ON "site_layout_menu_children" USING btree ("link_page_id");
  CREATE INDEX "site_layout_menu_order_idx" ON "site_layout_menu" USING btree ("_order");
  CREATE INDEX "site_layout_menu_parent_id_idx" ON "site_layout_menu" USING btree ("_parent_id");
  CREATE INDEX "site_layout_menu_link_link_page_idx" ON "site_layout_menu" USING btree ("link_page_id");
  CREATE INDEX "site_layout_rels_order_idx" ON "site_layout_rels" USING btree ("order");
  CREATE INDEX "site_layout_rels_parent_idx" ON "site_layout_rels" USING btree ("parent_id");
  CREATE INDEX "site_layout_rels_path_idx" ON "site_layout_rels" USING btree ("path");
  CREATE INDEX "site_layout_rels_events_id_idx" ON "site_layout_rels" USING btree ("events_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_section_id_site_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."site_sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_sections_fk" FOREIGN KEY ("site_sections_id") REFERENCES "public"."site_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_featured_id_events_id_fk" FOREIGN KEY ("home_events_featured_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_recent_id_events_id_fk" FOREIGN KEY ("home_events_recent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_home_events_image_id_media_id_fk" FOREIGN KEY ("home_events_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_video_id_videos_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_key_idx" ON "pages" USING btree ("key");
  CREATE INDEX "pages_section_idx" ON "pages" USING btree ("section_id");
  CREATE INDEX "payload_locked_documents_rels_site_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("site_sections_id");
  CREATE INDEX "site_layout_home_events_home_events_featured_idx" ON "site_layout" USING btree ("home_events_featured_id");
  CREATE INDEX "site_layout_home_events_home_events_recent_idx" ON "site_layout" USING btree ("home_events_recent_id");
  CREATE INDEX "site_layout_home_events_home_events_image_idx" ON "site_layout" USING btree ("home_events_image_id");
  CREATE INDEX "site_settings_hero_video_idx" ON "site_settings" USING btree ("hero_video_id");
  ALTER TABLE "pages_blocks_text" DROP COLUMN "split_tabs";
  ALTER TABLE "pages_blocks_text" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_buttons" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "hidden";
  ALTER TABLE "pages" DROP COLUMN "_order";
  ALTER TABLE "pages" DROP COLUMN "banner_id";
  ALTER TABLE "pages" DROP COLUMN "slogan";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "menu_label";
  ALTER TABLE "pages" DROP COLUMN "kind";
  ALTER TABLE "pages" DROP COLUMN "parent_id";
  ALTER TABLE "pages" DROP COLUMN "show_in_menu";
  ALTER TABLE "pages" DROP COLUMN "dropdown";
  ALTER TABLE "pages" DROP COLUMN "also_in_top_menu";
  ALTER TABLE "pages_rels" DROP COLUMN "videos_id";
  ALTER TABLE "pages_rels" DROP COLUMN "events_id";
  DROP TYPE "public"."enum_pages_blocks_hero_buttons_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_buttons_link_route";
  DROP TYPE "public"."enum_pages_blocks_hero_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_hero_mode";
  DROP TYPE "public"."enum_pages_blocks_text_image_image_side";
  DROP TYPE "public"."enum_pages_blocks_people_group";
  DROP TYPE "public"."enum_pages_blocks_events_mode";
  DROP TYPE "public"."enum_pages_blocks_tiles_items_icon";
  DROP TYPE "public"."enum_pages_blocks_tiles_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_tiles_items_link_route";
  DROP TYPE "public"."enum_pages_blocks_tiles_more_link_type";
  DROP TYPE "public"."enum_pages_blocks_tiles_more_link_route";
  DROP TYPE "public"."enum_pages_blocks_contact_band_button_link_type";
  DROP TYPE "public"."enum_pages_blocks_contact_band_button_link_route";
  DROP TYPE "public"."enum_pages_kind";`)
}
