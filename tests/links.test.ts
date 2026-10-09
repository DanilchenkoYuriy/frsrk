import { describe, expect, it } from "vitest";
import type { Page } from "@/payload-types";
import { buildTree } from "@/lib/tree";
import { linkHref, visibleLinks } from "@/lib/links";

const text = { blockType: "text" as const, content: {} as never };
let n = 0;
const page = (p: Partial<Page>): Page => ({ id: ++n, title: "Страница", updatedAt: "", createdAt: "", ...p }) as Page;

const home = page({ kind: "home", title: "Главная", layout: [text] });
const about = page({ kind: "about", title: "О федерации", layout: [text] });
const history = page({ kind: "history", title: "История", parent: about.id, layout: [text] });
const team = page({ kind: "custom", title: "Команда", slug: "team", parent: about.id, layout: [text] });
const participants = page({ kind: "participants", title: "Участникам", layout: [], dropdown: true });
const coaches = page({ kind: "coaches", title: "Тренерам", parent: participants.id, layout: [text] });
const antidoping = page({ kind: "antidoping", title: "Антидопинг", parent: participants.id, alsoInTopMenu: true, layout: [text] });
const news = page({ kind: "news", title: "Новости", showInMenu: false, layout: [text] });
const draft = page({ kind: "custom", title: "Черновик", slug: "draft", published: false, layout: [text] });
const inDraft = page({ kind: "custom", title: "Внутри черновика", slug: "inner", parent: draft.id, layout: [text] });
const tree = buildTree([home, about, history, team, participants, coaches, antidoping, news, draft, inDraft]);

describe("дерево страниц", () => {
  it("адреса встроенных и новых страниц", () => {
    expect(tree.hrefOf(history.id)).toBe("/about/history");
    expect(tree.hrefOf(team.id)).toBe("/about/team");
    expect(tree.byHref("/about/team")?.id).toBe(team.id);
  });

  it("скрытый раздел скрывает и свои страницы", () => {
    expect(tree.hrefOf(draft.id)).toBeNull();
    expect(tree.hrefOf(inDraft.id)).toBeNull();
  });

  it("верхнее меню: порядок, скрытые, выпадающий список и закреплённые", () => {
    const menu = tree.topMenu();
    expect(menu.map((m) => m.label)).toEqual(["Главная", "О федерации", "Участникам", "Антидопинг"]);
    // Пустой раздел ведёт на свой первый пункт
    expect(menu[2].href).toBe("/participants/coaches");
    expect(menu[2].children?.map((c) => c.label)).toEqual(["Тренерам", "Антидопинг"]);
  });

  it("меню слева: раздел с блоками входит в список, пустой нет", () => {
    expect(tree.sideMenu(tree.byId(about.id)!).map((i) => i.label)).toEqual(["О федерации", "История", "Команда"]);
    expect(tree.sideMenu(tree.byId(participants.id)!).map((i) => i.label)).toEqual(["Тренерам", "Антидопинг"]);
  });
});

describe("ссылки из админки", () => {
  it("встроенный адрес, страница и своя ссылка", () => {
    expect(linkHref({ type: "route", route: "calendar" }, tree)).toBe("/calendar");
    expect(linkHref({ type: "page", page: team.id }, tree)).toBe("/about/team");
    expect(linkHref({ type: "page", page: draft.id }, tree)).toBeNull();
    expect(linkHref({ type: "url", url: "https://vk.ru" }, tree)).toBe("https://vk.ru");
  });

  it("скрытые и пустые пункты не показываются", () => {
    const items = [
      { label: "А", link: { type: "route" as const, route: "news" } },
      { label: "Б", link: { type: "route" as const, route: "media" }, hidden: true },
      { label: "В", link: { type: "url" as const, url: " " } },
    ];
    expect(visibleLinks(items, tree).map((i) => i.href)).toEqual(["/news"]);
  });
});
