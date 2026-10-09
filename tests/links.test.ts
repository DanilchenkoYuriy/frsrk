import { describe, expect, it } from "vitest";
import { linkHref, pageHref, visibleLinks } from "@/lib/links";

describe("ссылки из админки", () => {
  it("встроенная страница сайта", () => {
    expect(linkHref({ type: "route", route: "calendar" })).toBe("/calendar");
    expect(linkHref({ route: "about" })).toBe("/about");
  });

  it("текстовая страница: встроенная, в разделе и отдельная", () => {
    expect(pageHref({ key: "parents", slug: null, section: null })).toBe("/participants/parents");
    expect(pageHref({ key: null, slug: "camp", section: { slug: "summer" } as never })).toBe("/summer/camp");
    expect(pageHref({ key: null, slug: "camp", section: null })).toBe("/camp");
  });

  it("неопубликованная страница не даёт ссылку", () => {
    expect(linkHref({ type: "page", page: { key: null, slug: "x", section: null, published: false } as never })).toBeNull();
  });

  it("скрытые и пустые пункты не показываются", () => {
    const items = [
      { label: "А", link: { route: "news" } },
      { label: "Б", link: { route: "media" }, hidden: true },
      { label: "В", link: { type: "url" as const, url: " " } },
    ];
    expect(visibleLinks(items).map((i) => i.href)).toEqual(["/news"]);
  });
});
