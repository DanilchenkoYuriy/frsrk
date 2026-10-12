import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";

// Данные, а не схема: раздел «Участникам → Пособия» и страница с 3D-схемой «Прыжки через 2 скакалки 4 человека»
// (текст: копия content/pages/2-skakalki-4-cheloveka.md, сама схема: public/tools/dd-relay).
// Ссылки на схему ставятся на главную, на страницы «Тренерам», «Судьям» и «Правила вида спорта».

const INTRO = `Схема сделана для тренеров, судей и спортсменов, которые готовятся к дисциплине «прыжки через две скакалки 4 человека». Спортсмены обозначены буквами A, B, C и D, как в правилах вида спорта.

Как пользоваться:

- вкладка «По шагам» показывает каждую смену отдельно, шаг можно повторить;
- вкладка «Прогон 180 с» проигрывает выступление целиком с сигналами звукового трека;
- камеры переключают вид: схема сверху, обзор зала, место судьи, вид сбоку и глазами прыгающего;
- в разделе «Разбор ошибок» можно включить фальстарт, вход раньше выхода или обход не с той стороны и посмотреть, как это выглядит;
- нажмите на спортсмена, чтобы следить только за его маршрутом.

На телефоне удобнее открыть схему на весь экран кнопкой под ней.`;

const BODY = `## Порядок смен

Время выполнения 180 секунд. Каждый спортсмен команды должен побывать и вращающим, и прыгающим.

1. A и B вращают. По сигналу «Старт» C заходит в скакалки и прыгает лицом к B. D в это время стоит слева от B лицом к A.
2. По сигналу «Смена» C выходит и меняет B на вращении, D заходит и прыгает лицом к A. Пока прыгает D, B обходит C с правой стороны и встаёт слева от A.
3. По сигналу «Смена» D меняет A на вращении, B заходит прыгать. A обходит D с правой стороны и встаёт слева от C.
4. По сигналу «Смена» B меняет C на вращении, A заходит и прыгает лицом к D.

## Главные требования

- Все участники команды выполняют прыжки по очереди.
- Внутри скакалок одновременно может быть только один спортсмен.
- Прыгающий выходит из скакалок до того, как его сменит партнёр.

## Штрафы

- Нарушение пространства: 5 баллов за каждое.
- Задержка соревнований: 10 баллов.
- Значительный фальстарт: 20 баллов.
- Незначительный фальстарт: 5 баллов.
- Нарушение требований к костюму, потеря аксессуаров для волос или очков: 3 балла.
- Если прыгают не все члены команды или схема переходов не сохранена, команда получает 0 баллов.

Полный текст в разделе «Правила вида спорта».`;

const TILE_TITLE = "3D-схема: прыжки через 2 скакалки 4 человека";
const TILE_TEXT = "Смены и перемещения по шагам, прогон 180 секунд, разбор ошибок и штрафы";

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const find = async (kind: string) =>
    (await payload.find({ collection: "pages", where: { kind: { equals: kind } }, limit: 1, depth: 0, overrideAccess: true, req })).docs[0];

  const participants = await find("participants");
  if (!participants) return;
  const exists = await payload.find({ collection: "pages", where: { slug: { equals: "posobiya" } }, limit: 1, depth: 0, overrideAccess: true, req });
  if (exists.docs.length) return;

  const editorConfig = await editorConfigFactory.default({ config: payload.config });
  const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown });

  const hub = await payload.create({
    collection: "pages",
    data: {
      kind: "custom",
      title: "Пособия",
      slug: "posobiya",
      parent: participants.id,
      lead: "Учебные материалы федерации для тренеров, судей и спортсменов.",
      metaDescription: "Пособия по роуп скиппингу (спортивной скакалке) для тренеров и судей: 3D-схемы дисциплин, смены и перемещения, разбор ошибок.",
      layout: [],
    },
    overrideAccess: true,
    req,
  });

  const relay = await payload.create({
    collection: "pages",
    data: {
      kind: "custom",
      title: "Прыжки через 2 скакалки 4 человека",
      slug: "2-skakalki-4-cheloveka",
      parent: hub.id,
      lead: "Кто вращает, кто прыгает и как спортсмены меняются местами. Схему можно смотреть по шагам, прогнать целиком и разобрать типичные ошибки.",
      metaTitle: "Прыжки через 2 скакалки 4 человека (дабл датч эстафета): 3D-схема смен",
      metaDescription: "Интерактивная 3D-схема дисциплины «прыжки через две скакалки 4 человека»: порядок смен, перемещения спортсменов, разбор ошибок и штрафы по правилам вида спорта.",
      layout: [
        { blockType: "text", content: md(INTRO) },
        { blockType: "scheme", scheme: "dd-relay" },
        { blockType: "text", content: md(BODY) },
      ],
    },
    overrideAccess: true,
    req,
  });

  const tile = { icon: "cube" as const, title: TILE_TITLE, text: TILE_TEXT, link: { type: "page" as const, page: relay.id } };

  await payload.update({
    collection: "pages",
    id: hub.id,
    data: { layout: [{ blockType: "tiles", title: "Схемы дисциплин", items: [tile] }] },
    overrideAccess: true,
    req,
  });

  // Плитка со ссылкой на схему в начале страниц «Тренерам» и «Судьям», в «Правилах» над текстом правил
  for (const kind of ["coaches", "judges", "rules"]) {
    const page = await find(kind);
    if (!page) continue;
    await payload.update({
      collection: "pages",
      id: page.id,
      data: { layout: [{ blockType: "tiles", kicker: "Пособия", items: [tile] }, ...(page.layout ?? [])] },
      overrideAccess: true,
      req,
    });
  }

  // На главной: отдельная полоса после плиток с документами
  const home = await find("home");
  if (home) {
    const layout = home.layout ?? [];
    const at = layout.findIndex((b) => b.blockType === "tiles");
    const block = { blockType: "tiles" as const, kicker: "Пособия", title: "Тренерам и судьям", items: [tile] };
    const next = at === -1 ? [...layout, block] : [...layout.slice(0, at + 1), block, ...layout.slice(at + 1)];
    await payload.update({ collection: "pages", id: home.id, data: { layout: next }, overrideAccess: true, req });
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Страницы и плитки можно убрать в админке: «Структура сайта → Страницы сайта»
}
