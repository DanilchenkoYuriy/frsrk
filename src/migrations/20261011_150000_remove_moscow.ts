import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

// Данные, а не схема: «Москва» попала в справочник муниципальных образований Крыма ради мероприятий
// и стала видна в списке на странице «Найти секцию». Место переносится в «Площадку и адрес»,
// запись удаляется, если на неё не ссылаются секции и рейтинг.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "events" e
    SET "venue" = CASE
          WHEN coalesce(trim(e."venue"), '') = '' THEN m."name"
          WHEN e."venue" ILIKE '%' || m."name" || '%' THEN e."venue"
          ELSE m."name" || ', ' || e."venue"
        END,
        "municipality_id" = NULL
    FROM "municipalities" m
    WHERE e."municipality_id" = m."id" AND m."name" = 'Москва';

    DELETE FROM "municipalities" m
    WHERE m."name" = 'Москва'
      AND NOT EXISTS (SELECT 1 FROM "sections" s WHERE s."municipality_id" = m."id")
      AND NOT EXISTS (SELECT 1 FROM "ranking_entries" r WHERE r."municipality_id" = m."id");`);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Удалённую запись не восстанавливаем: место мероприятий уже записано в «Площадку и адрес»
}
