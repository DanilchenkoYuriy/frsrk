/**
 * Тексты страниц из content/pages/*.md: добавляются во встроенные страницы, где текста ещё нет.
 * Уже заполненные страницы не трогаются: владелец мог изменить их в админке.
 */
import fs from "node:fs";
import path from "node:path";
import type { Payload } from "payload";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";

const pagesDir = path.resolve(import.meta.dirname, "..", "content", "pages");

/** only: ключи страниц (как в файлах .md), которые нужно заполнить. Если пусто, заполняются все. */
export async function seedPageTexts(p: Payload, log: (msg: string) => void, only: string[] = []) {
  const editorConfig = await editorConfigFactory.default({ config: p.config });
  for (const name of fs.readdirSync(pagesDir).filter((f) => f.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(pagesDir, name), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) continue;
    const meta = Object.fromEntries(match[1].split("\n").map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
    const markdown = match[2].trim();
    const body = markdown ? convertMarkdownToLexical({ editorConfig, markdown }) : undefined;
    // В файлах страниц старые ключи; встроенные страницы создаёт миграция, здесь в них добавляется текст
    if (only.length && !only.includes(meta.key)) continue;
    const kind = ({ "education-judges": "judges", "education-coaches": "coaches" } as Record<string, string>)[meta.key] ?? meta.key;
    const res = await p.find({ collection: "pages", where: { kind: { equals: kind } }, limit: 1, depth: 0, overrideAccess: true });
    const page = res.docs[0];
    // Уже заполненные страницы не перезаписываем: редактор мог их изменить в админке.
    if (!body) continue;
    // Текст правил живёт внутри «Основного содержимого»: там он делится на вкладки рядом с дисциплинами
    if (kind === "rules" && page) {
      const layout = page.layout ?? [];
      const builtin = layout.find((b) => b.blockType === "builtin");
      if (builtin?.blockType !== "builtin" || builtin.content) continue;
      await p.update({ collection: "pages", id: page.id, data: { layout: layout.map((b) => (b === builtin ? { ...b, content: body } : b)) }, overrideAccess: true });
      log(`+ ${meta.title}`);
      continue;
    }
    if (page && (page.layout ?? []).some((b) => b.blockType === "text")) continue;
    const text = { blockType: "text" as const, content: body, splitTabs: !["about", "privacy", "cookies"].includes(kind) };
    if (page) {
      await p.update({ collection: "pages", id: page.id, data: { lead: page.lead ?? meta.lead, layout: [text, ...(page.layout ?? [])] }, overrideAccess: true });
    } else {
      await p.create({ collection: "pages", data: { kind: kind as never, title: meta.title, lead: meta.lead, layout: [text], published: true }, overrideAccess: true });
    }
    log(`+ ${meta.title}`);
  }
}
