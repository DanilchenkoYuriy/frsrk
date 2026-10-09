import type { Page } from "@/payload-types";
import { routeHref } from "@/lib/constants";
import type { SiteTree } from "@/lib/tree";

/** Поле «Куда ведёт» из админки (src/fields/link.ts). */
export interface CmsLink {
  type?: "route" | "page" | "url" | null;
  route?: string | null;
  page?: number | Page | null;
  url?: string | null;
}

/** Адрес ссылки на сайте или null, если ссылка пустая или ведёт на скрытую страницу (такой пункт не показывается). */
export function linkHref(link: CmsLink | null | undefined, tree: SiteTree): string | null {
  if (!link) return null;
  switch (link.type ?? "page") {
    case "route":
      return routeHref(link.route);
    case "page":
      return tree.hrefOf(link.page && typeof link.page === "object" ? link.page.id : link.page);
    case "url":
      return link.url?.trim() || null;
    default:
      return null;
  }
}

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

interface Linkable {
  link?: CmsLink | null;
  hidden?: boolean | null;
}

/** Видимые пункты с готовыми адресами: скрытые и пустые отбрасываются. */
export function visibleLinks<T extends Linkable>(items: readonly T[] | null | undefined, tree: SiteTree): (T & { href: string })[] {
  return (items ?? []).flatMap((item) => {
    const href = item.hidden ? null : linkHref(item.link, tree);
    return href ? [{ ...item, href }] : [];
  });
}
