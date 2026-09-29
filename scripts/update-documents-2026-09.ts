/**
 * Разовое обновление каталога документов, сентябрь 2026 года.
 * Новые документы (кодекс этики, свидетельства, выписка из реестра, действующий федеральный
 * стандарт) добавляет обычный `npm run seed` / `npm run seed:prod` — их достаточно просто запустить.
 * Этот скрипт делает то, что обычный seed не умеет: удаляет устаревший документ и заменяет файл
 * у уже существующей записи, плюс один раз заполняет ИНН/КПП в реквизитах.
 *
 * Запуск: npm run update-docs (локально) или npm run update-docs:prod (на боевую базу,
 * тем же способом, что и seed:prod — см. ИНСТРУКЦИЯ-ПОДКЛЮЧЕНИЯ.md, шаг 8).
 * Повторный запуск безопасен: то, что уже применено, пропускается.
 */
import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import config from "@payload-config";

const root = path.resolve(import.meta.dirname, "..");
const assets = process.env.SEED_ASSETS_DIR ?? path.join(root, "seed-assets");

function fileOf(filePath: string) {
  const data = fs.readFileSync(filePath);
  return { data, mimetype: "application/pdf", name: path.basename(filePath), size: data.length };
}

const log = (msg: string) => console.log(`  ${msg}`);

async function main() {
  const p = await getPayload({ config });
  console.log("Обновление документов…");

  // ── Удаляем устаревшую заглушку федерального стандарта ──────────────────
  const oldStandard = await p.find({
    collection: "documents",
    where: { title: { equals: "Федеральный стандарт спортивной подготовки: проект приказа 2021 года" } },
    limit: 1,
    overrideAccess: true,
  });
  if (oldStandard.docs[0]) {
    await p.delete({ collection: "documents", id: oldStandard.docs[0].id, overrideAccess: true });
    log("− удалён проект федерального стандарта 2021 года (заменён действующим приказом № 905)");
  } else {
    log("проект федерального стандарта уже удалён, пропуск");
  }

  // ── Удаляем архивную редакцию ЕВСК 2022–2025 годов (заменена редакцией 2026 года) ──
  const oldEvsk = await p.find({
    collection: "documents",
    where: { title: { equals: "ЕВСК: нормы и требования по роуп скиппингу, редакция 2022–2025 годов" } },
    limit: 1,
    overrideAccess: true,
  });
  if (oldEvsk.docs[0]) {
    await p.delete({ collection: "documents", id: oldEvsk.docs[0].id, overrideAccess: true });
    log("− удалена архивная редакция ЕВСК 2022–2025 годов (заменена редакцией 2026 года)");
  } else {
    log("архивная редакция ЕВСК 2022–2025 уже удалена, пропуск");
  }

  // ── Заменяем файл «Правила вида спорта» на чистую копию без ошибок распознавания ──
  const rules = await p.find({
    collection: "documents",
    where: { title: { equals: "Правила вида спорта «роуп скиппинг (спортивная скакалка)»" } },
    limit: 1,
    overrideAccess: true,
  });
  if (rules.docs[0]) {
    const file = path.join(assets, "documents", "pravila-vida-sporta-2024.pdf");
    await p.update({ collection: "documents", id: rules.docs[0].id, data: {}, file: fileOf(file), overrideAccess: true });
    log("↻ обновлён файл «Правила вида спорта» (чистая копия приказа № 264)");
  } else {
    log("документ «Правила вида спорта» не найден, файл не заменён");
  }

  // ── Реквизиты: ИНН и КПП по свидетельству о постановке на учёт от 05.03.2024 ──
  const settings = await p.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
  const patch: Record<string, string> = {};
  if (!settings.inn) patch.inn = "9102295198";
  if (!settings.kpp) patch.kpp = "9102010001";
  if (Object.keys(patch).length > 0) {
    await p.updateGlobal({ slug: "site-settings", data: patch, overrideAccess: true });
    log(`+ заполнены реквизиты: ${Object.keys(patch).join(", ")}`);
  } else {
    log("ИНН и КПП уже заполнены, пропуск");
  }

  // ── Срок аккредитации: добавляем точную дату окончания, если поле не правили вручную ──
  const oldTerm = "три года со дня подписания приказа";
  if (settings.accreditation?.term === oldTerm) {
    await p.updateGlobal({
      slug: "site-settings",
      data: { accreditation: { ...settings.accreditation, term: "три года со дня подписания приказа, до 22 апреля 2027 года" } },
      overrideAccess: true,
    });
    log("↻ уточнён срок аккредитации (дата окончания)");
  } else {
    log("срок аккредитации уже изменён в админке, не трогаем");
  }

  console.log("Готово.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
