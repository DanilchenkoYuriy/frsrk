/**
 * Первичное наполнение сайта: муниципалитеты, люди, секции, мероприятия, тексты страниц,
 * документы, музыка и картинки. Файлы загружаются в хранилище (S3, если оно настроено в .env).
 * Повторный запуск безопасен: то, что уже есть, пропускается.
 *
 * Запуск: npm run seed
 */
import fs from "node:fs";
import path from "node:path";
import { getPayload, type Payload, type CollectionSlug } from "payload";
import config from "@payload-config";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { AUDIO, DOCUMENTS, EVENTS, MUNICIPALITIES, PEOPLE, SECTIONS } from "./seed-data";

const root = path.resolve(import.meta.dirname, "..");
const assets = process.env.SEED_ASSETS_DIR ?? path.join(root, "seed-assets");
const pagesDir = path.join(root, "content", "pages");

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function fileOf(filePath: string) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  return { data, mimetype: MIME[ext] ?? "application/octet-stream", name: path.basename(filePath), size: data.length };
}

const log = (msg: string) => console.log(`  ${msg}`);
const iso = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();

async function exists(p: Payload, collection: CollectionSlug, where: Record<string, unknown>) {
  const res = await p.find({ collection, where: where as never, limit: 1, depth: 0, overrideAccess: true });
  return res.docs[0] as { id: number } | undefined;
}

async function main() {
  const p = await getPayload({ config });
  console.log("Наполнение сайта…");

  // ── Муниципальные образования ──────────────────────────────────────────
  console.log("Муниципальные образования");
  const muni = new Map<string, number>();
  for (const m of MUNICIPALITIES) {
    const found = await exists(p, "municipalities", { slug: { equals: m.slug } });
    if (found) muni.set(m.slug, found.id);
    else {
      const doc = await p.create({ collection: "municipalities", data: { name: m.name, slug: m.slug, kind: m.kind }, overrideAccess: true });
      muni.set(m.slug, doc.id);
    }
  }
  log(`${muni.size} записей`);

  // ── Люди ───────────────────────────────────────────────────────────────
  console.log("Руководство и представители");
  const people = new Map<string, number>();
  for (const person of PEOPLE) {
    const found = await exists(p, "people", { name: { equals: person.name } });
    if (found) {
      people.set(person.id, found.id);
      continue;
    }
    const doc = await p.create({
      collection: "people",
      data: { name: person.name, position: person.position, group: person.group, order: person.order, published: true },
      overrideAccess: true,
    });
    people.set(person.id, doc.id);
    log(`+ ${person.name}`);
  }
  for (const person of PEOPLE) {
    await p.update({ collection: "municipalities", where: { slug: { equals: person.city } }, data: { representative: people.get(person.id) }, overrideAccess: true });
  }

  // ── Секции ─────────────────────────────────────────────────────────────
  console.log("Секции");
  for (const s of SECTIONS) {
    if (await exists(p, "sections", { title: { equals: s.title } })) continue;
    await p.create({
      collection: "sections",
      data: {
        title: s.title,
        municipality: muni.get(s.city)!,
        address: s.address,
        coach: s.coach,
        phone: s.phone,
        messengerUrl: s.messengerUrl,
        published: true,
      },
      overrideAccess: true,
    });
    log(`+ ${s.title}`);
  }

  // ── Мероприятия ────────────────────────────────────────────────────────
  console.log("Календарь");
  for (const e of EVENTS) {
    if (await exists(p, "events", { slug: { equals: e.slug } })) continue;
    await p.create({
      collection: "events",
      data: {
        title: e.title,
        slug: e.slug,
        type: e.type,
        level: e.level,
        dateFrom: iso(e.dateFrom),
        dateTo: iso(e.dateTo),
        municipality: "city" in e ? muni.get(e.city) : undefined,
        venue: "venue" in e ? e.venue : undefined,
        published: true,
      },
      overrideAccess: true,
    });
    log(`+ ${e.title}`);
  }

  // ── Документы ──────────────────────────────────────────────────────────
  console.log("Документы (загрузка файлов)");
  for (const d of DOCUMENTS) {
    if (await exists(p, "documents", { title: { equals: d.title } })) continue;
    const file = path.join(assets, "documents", d.file);
    if (!fs.existsSync(file)) {
      log(`нет файла ${d.file}, пропуск`);
      continue;
    }
    await p.create({
      collection: "documents",
      data: {
        title: d.title,
        category: d.category,
        order: d.order,
        number: d.number,
        docDate: d.date ? iso(d.date) : undefined,
        description: d.description,
        status: d.status ?? "current",
        published: d.published,
      },
      file: fileOf(file),
      overrideAccess: true,
    });
    log(`+ ${d.title.slice(0, 70)}${d.published ? "" : "  (скрыт, ждёт проверки)"}`);
  }

  // ── Музыка ─────────────────────────────────────────────────────────────
  console.log("Музыка (загрузка файлов)");
  let order = 10;
  for (const a of AUDIO) {
    order += 10;
    if (await exists(p, "audio-tracks", { title: { equals: a.title } })) continue;
    const file = path.join(assets, "audio", a.file);
    if (!fs.existsSync(file)) {
      log(`нет файла ${a.file}, пропуск`);
      continue;
    }
    await p.create({ collection: "audio-tracks", data: { title: a.title, order, published: true }, file: fileOf(file), overrideAccess: true });
    log(`+ ${a.title}`);
  }

  // ── Картинки ───────────────────────────────────────────────────────────
  console.log("Картинки");
  const prepared = path.join(assets, "prepared");
  const media = new Map<string, number>();
  const putImage = async (key: string, file: string, alt: string) => {
    const found = await exists(p, "media", { alt: { equals: alt } });
    if (found) return void media.set(key, found.id);
    if (!fs.existsSync(file)) return void log(`нет файла ${path.basename(file)}, пропуск`);
    const doc = await p.create({ collection: "media", data: { alt }, file: fileOf(file), overrideAccess: true });
    media.set(key, doc.id);
    log(`+ ${alt.slice(0, 60)}`);
  };
  await putImage("hero", path.join(prepared, "hero.jpg"), "Спортсменка со скакалкой на фоне гор и побережья Крыма");
  await putImage("og", path.join(prepared, "og.jpg"), "Федерация роуп скиппинга Республики Крым");

  // ── Настройки сайта ────────────────────────────────────────────────────
  await p.updateGlobal({
    slug: "site-settings",
    data: { heroImage: media.get("hero"), ogImage: media.get("og") },
    overrideAccess: true,
  });

  // ── Тексты страниц ─────────────────────────────────────────────────────
  console.log("Тексты страниц");
  const editorConfig = await editorConfigFactory.default({ config: p.config });
  for (const name of fs.readdirSync(pagesDir).filter((f) => f.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(pagesDir, name), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) continue;
    const meta = Object.fromEntries(match[1].split("\n").map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
    const markdown = match[2].trim();
    const body = markdown ? convertMarkdownToLexical({ editorConfig, markdown }) : undefined;
    const found = await exists(p, "pages", { key: { equals: meta.key } });
    // Уже существующие страницы не перезаписываем: редактор мог их изменить в админке.
    if (found) continue;
    await p.create({
      collection: "pages",
      data: { key: meta.key as never, title: meta.title, lead: meta.lead, body, published: true },
      overrideAccess: true,
    });
    log(`+ ${meta.title}`);
  }

  // ── Фотоархив (черновик) ───────────────────────────────────────────────
  const photosDir = path.join(prepared, "photos");
  if (fs.existsSync(photosDir) && !(await exists(p, "galleries", { slug: { equals: "fotoarhiv" } }))) {
    console.log("Фотоархив");
    const ids: number[] = [];
    // Лучшие кадры идут первыми: их показывает главная страница
    const all = fs.readdirSync(photosDir).sort();
    const first = [0, 1, 5, 7, 23, 30].filter((i) => i < all.length);
    const ordered = [...first.map((i) => all[i]), ...all.filter((_, i) => !first.includes(i))];
    for (const f of ordered) {
      const doc = await p.create({
        collection: "media",
        data: { alt: "Фотография с соревнований по роуп скиппингу из архива федерации", credit: "Архив ФРСРК" },
        file: fileOf(path.join(photosDir, f)),
        overrideAccess: true,
      });
      ids.push(doc.id);
    }
    await p.create({
      collection: "galleries",
      data: {
        title: "Фотоархив федерации",
        slug: "fotoarhiv",
        date: new Date().toISOString(),
        description: "Фотографии с соревнований и мероприятий федерации.",
        cover: ids[0],
        photos: ids.map((image) => ({ image })),
        published: true,
      },
      overrideAccess: true,
    });
    log(`+ ${ids.length} фото. Альбом опубликован: проверьте согласия родителей, при необходимости скройте его в админке.`);
  }

  console.log("Готово.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
