import { randomBytes } from 'node:crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

type Db = MigrateUpArgs['db']
type Item = [label: string, route: string]

const rowId = () => randomBytes(12).toString('hex')

/** Текущее меню, подвал и разделы переносятся в админку как есть, чтобы сайт после обновления выглядел так же. */
const MENU: Item[] = [
  ['Главная', 'home'],
  ['Календарь', 'calendar'],
  ['Документы', 'documents'],
  ['Новости', 'news'],
  ['Медиа', 'media'],
  ['Участникам', 'participants'],
  ['О федерации', 'about'],
  ['Контакты', 'contacts'],
  ['Антидопинг', 'antidoping'],
]

const FOOTER: [string, Item[]][] = [
  ['Федерация', [['О федерации', 'about'], ['Руководство', 'leadership'], ['Реквизиты', 'requisites'], ['История', 'history'], ['Контакты', 'contacts']]],
  ['Участникам', [['Найти секцию', 'sections'], ['Тренерам', 'coaches'], ['Судьям', 'judges'], ['Родителям', 'parents'], ['Рейтинг спортсменов', 'ranking'], ['Антидопинг', 'antidoping']]],
  ['Материалы', [['Календарь', 'calendar'], ['Документы', 'documents'], ['Правила вида спорта', 'rules'], ['Музыка для соревнований', 'audio'], ['Новости', 'news'], ['Медиа', 'media']]],
]

const SECTIONS: [title: string, slug: string, Item[]][] = [
  ['Участникам', 'participants', [['Тренерам', 'coaches'], ['Судьям', 'judges'], ['Родителям', 'parents'], ['Рейтинг спортсменов', 'ranking'], ['Антидопинг', 'antidoping']]],
  ['О федерации', 'about', [['О федерации', 'about'], ['Руководство', 'leadership'], ['Реквизиты', 'requisites'], ['История', 'history']]],
]

async function seedStructure(db: Db): Promise<void> {
  const settings = await db.execute(sql`SELECT "vk", "telegram" FROM "site_settings" ORDER BY "id" LIMIT 1`)
  const row = (settings.rows[0] ?? { vk: 'https://vk.ru/rope_skipping_crimea', telegram: 'https://t.me/+3uyHm_gL9wtmNzRi' }) as { vk: string | null; telegram: string | null }

  const layout = await db.execute(sql`
    INSERT INTO "site_layout" ("cta_link_type", "cta_link_route", "updated_at", "created_at")
    VALUES ('route', 'sections', now(), now()) RETURNING "id"`)
  const layoutId = (layout.rows[0] as { id: number }).id

  for (const [i, [label, route]] of MENU.entries()) {
    await db.execute(sql`
      INSERT INTO "site_layout_menu" ("_order", "_parent_id", "id", "label", "link_type", "link_route")
      VALUES (${i + 1}, ${layoutId}, ${rowId()}, ${label}, 'route', ${route})`)
  }

  const socials = [
    ['vk', 'Сообщество федерации', row.vk],
    ['telegram', 'Канал федерации', row.telegram],
  ].filter(([, , url]) => url && url.trim())
  for (const [i, [network, label, url]] of socials.entries()) {
    await db.execute(sql`
      INSERT INTO "site_layout_socials" ("_order", "_parent_id", "id", "network", "label", "url")
      VALUES (${i + 1}, ${layoutId}, ${rowId()}, ${network}, ${label}, ${url})`)
  }

  for (const [i, [title, links]] of FOOTER.entries()) {
    const columnId = rowId()
    await db.execute(sql`
      INSERT INTO "site_layout_footer_columns" ("_order", "_parent_id", "id", "title")
      VALUES (${i + 1}, ${layoutId}, ${columnId}, ${title})`)
    for (const [j, [label, route]] of links.entries()) {
      await db.execute(sql`
        INSERT INTO "site_layout_footer_columns_links" ("_order", "_parent_id", "id", "label", "link_type", "link_route")
        VALUES (${j + 1}, ${columnId}, ${rowId()}, ${label}, 'route', ${route})`)
    }
  }

  for (const [title, slug, items] of SECTIONS) {
    const section = await db.execute(sql`
      INSERT INTO "site_sections" ("title", "slug", "published") VALUES (${title}, ${slug}, true) RETURNING "id"`)
    const sectionId = (section.rows[0] as { id: number }).id
    for (const [i, [label, route]] of items.entries()) {
      await db.execute(sql`
        INSERT INTO "site_sections_items" ("_order", "_parent_id", "id", "label", "link_type", "link_route")
        VALUES (${i + 1}, ${sectionId}, ${rowId()}, ${label}, 'route', ${route})`)
    }
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_documents_mode" AS ENUM('category', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_documents_category" AS ENUM('federation', 'rules', 'classification', 'regulations', 'education', 'orders', 'antidoping', 'forms');
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('red', 'line');
  CREATE TYPE "public"."enum_site_sections_items_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_sections_items_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_menu_children_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_menu_children_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_menu_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_menu_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_socials_network" AS ENUM('vk', 'telegram', 'youtube', 'other');
  CREATE TYPE "public"."enum_site_layout_footer_columns_links_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_footer_columns_links_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TYPE "public"."enum_site_layout_cta_link_type" AS ENUM('route', 'page', 'url');
  CREATE TYPE "public"."enum_site_layout_cta_link_route" AS ENUM('home', 'calendar', 'documents', 'rules', 'audio', 'news', 'media', 'sections', 'contacts', 'participants', 'coaches', 'judges', 'parents', 'ranking', 'antidoping', 'about', 'leadership', 'requisites', 'history', 'privacy', 'cookies');
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_pages_blocks_documents_mode" DEFAULT 'category',
  	"category" "enum_pages_blocks_documents_category",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_buttons_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_pages_blocks_buttons_buttons_link_type" DEFAULT 'route',
  	"link_route" "enum_pages_blocks_buttons_buttons_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"style" "enum_pages_blocks_buttons_buttons_style" DEFAULT 'line'
  );
  
  CREATE TABLE "pages_blocks_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer
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
  
  CREATE TABLE "site_layout_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_site_layout_socials_network" DEFAULT 'vk' NOT NULL,
  	"label" varchar,
  	"url" varchar NOT NULL,
  	"icon_id" integer,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_layout_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_site_layout_footer_columns_links_link_type" DEFAULT 'route',
  	"link_route" "enum_site_layout_footer_columns_links_link_route",
  	"link_page_id" integer,
  	"link_url" varchar,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_layout_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "site_layout" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_logo" boolean DEFAULT true,
  	"logo_id" integer,
  	"show_name" boolean DEFAULT true,
  	"slogan" varchar DEFAULT 'Сила в движении!',
  	"cta_show" boolean DEFAULT true,
  	"cta_label" varchar DEFAULT 'Найти секцию',
  	"cta_link_type" "enum_site_layout_cta_link_type" DEFAULT 'route',
  	"cta_link_route" "enum_site_layout_cta_link_route",
  	"cta_link_page_id" integer,
  	"cta_link_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" ALTER COLUMN "key" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "slug" varchar;
  ALTER TABLE "pages" ADD COLUMN "section_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_sections_id" integer;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_buttons_buttons" ADD CONSTRAINT "pages_blocks_buttons_buttons_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_buttons_buttons" ADD CONSTRAINT "pages_blocks_buttons_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_buttons" ADD CONSTRAINT "pages_blocks_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_tabs" ADD CONSTRAINT "pages_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_sections_items" ADD CONSTRAINT "site_sections_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_sections_items" ADD CONSTRAINT "site_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_sections" ADD CONSTRAINT "site_sections_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu_children" ADD CONSTRAINT "site_layout_menu_children_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu_children" ADD CONSTRAINT "site_layout_menu_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_menu" ADD CONSTRAINT "site_layout_menu_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_menu" ADD CONSTRAINT "site_layout_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_socials" ADD CONSTRAINT "site_layout_socials_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_socials" ADD CONSTRAINT "site_layout_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_footer_columns_links" ADD CONSTRAINT "site_layout_footer_columns_links_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout_footer_columns_links" ADD CONSTRAINT "site_layout_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout_footer_columns" ADD CONSTRAINT "site_layout_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_layout" ADD CONSTRAINT "site_layout_cta_link_page_id_pages_id_fk" FOREIGN KEY ("cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_buttons_buttons_order_idx" ON "pages_blocks_buttons_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_buttons_buttons_parent_id_idx" ON "pages_blocks_buttons_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_buttons_buttons_link_link_page_idx" ON "pages_blocks_buttons_buttons" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_buttons_order_idx" ON "pages_blocks_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_buttons_parent_id_idx" ON "pages_blocks_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_buttons_path_idx" ON "pages_blocks_buttons" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_tabs_order_idx" ON "pages_tabs" USING btree ("_order");
  CREATE INDEX "pages_tabs_parent_id_idx" ON "pages_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_documents_id_idx" ON "pages_rels" USING btree ("documents_id");
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
  CREATE INDEX "site_layout_socials_order_idx" ON "site_layout_socials" USING btree ("_order");
  CREATE INDEX "site_layout_socials_parent_id_idx" ON "site_layout_socials" USING btree ("_parent_id");
  CREATE INDEX "site_layout_socials_icon_idx" ON "site_layout_socials" USING btree ("icon_id");
  CREATE INDEX "site_layout_footer_columns_links_order_idx" ON "site_layout_footer_columns_links" USING btree ("_order");
  CREATE INDEX "site_layout_footer_columns_links_parent_id_idx" ON "site_layout_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "site_layout_footer_columns_links_link_link_page_idx" ON "site_layout_footer_columns_links" USING btree ("link_page_id");
  CREATE INDEX "site_layout_footer_columns_order_idx" ON "site_layout_footer_columns" USING btree ("_order");
  CREATE INDEX "site_layout_footer_columns_parent_id_idx" ON "site_layout_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_layout_logo_idx" ON "site_layout" USING btree ("logo_id");
  CREATE INDEX "site_layout_cta_link_cta_link_page_idx" ON "site_layout" USING btree ("cta_link_page_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_section_id_site_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."site_sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_sections_fk" FOREIGN KEY ("site_sections_id") REFERENCES "public"."site_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_section_idx" ON "pages" USING btree ("section_id");
  CREATE INDEX "payload_locked_documents_rels_site_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("site_sections_id");`)

  await seedStructure(db)

  await db.execute(sql`
  ALTER TABLE "site_settings" DROP COLUMN "vk";
  ALTER TABLE "site_settings" DROP COLUMN "telegram";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_buttons_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_menu_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout_footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_layout" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "pages_blocks_buttons_buttons" CASCADE;
  DROP TABLE "pages_blocks_buttons" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_tabs" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "site_sections_items" CASCADE;
  DROP TABLE "site_sections" CASCADE;
  DROP TABLE "site_layout_menu_children" CASCADE;
  DROP TABLE "site_layout_menu" CASCADE;
  DROP TABLE "site_layout_socials" CASCADE;
  DROP TABLE "site_layout_footer_columns_links" CASCADE;
  DROP TABLE "site_layout_footer_columns" CASCADE;
  DROP TABLE "site_layout" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_section_id_site_sections_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_sections_fk";
  
  DROP INDEX "pages_slug_idx";
  DROP INDEX "pages_section_idx";
  DROP INDEX "payload_locked_documents_rels_site_sections_id_idx";
  ALTER TABLE "pages" ALTER COLUMN "key" SET NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "vk" varchar DEFAULT 'https://vk.ru/rope_skipping_crimea';
  ALTER TABLE "site_settings" ADD COLUMN "telegram" varchar DEFAULT 'https://t.me/+3uyHm_gL9wtmNzRi';
  ALTER TABLE "pages" DROP COLUMN "slug";
  ALTER TABLE "pages" DROP COLUMN "section_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_sections_id";
  DROP TYPE "public"."enum_pages_blocks_documents_mode";
  DROP TYPE "public"."enum_pages_blocks_documents_category";
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_link_type";
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_link_route";
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  DROP TYPE "public"."enum_site_sections_items_link_type";
  DROP TYPE "public"."enum_site_sections_items_link_route";
  DROP TYPE "public"."enum_site_layout_menu_children_link_type";
  DROP TYPE "public"."enum_site_layout_menu_children_link_route";
  DROP TYPE "public"."enum_site_layout_menu_link_type";
  DROP TYPE "public"."enum_site_layout_menu_link_route";
  DROP TYPE "public"."enum_site_layout_socials_network";
  DROP TYPE "public"."enum_site_layout_footer_columns_links_link_type";
  DROP TYPE "public"."enum_site_layout_footer_columns_links_link_route";
  DROP TYPE "public"."enum_site_layout_cta_link_type";
  DROP TYPE "public"."enum_site_layout_cta_link_route";`)
}
