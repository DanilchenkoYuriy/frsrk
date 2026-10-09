import type { Page, SiteSection } from "@/payload-types";
import { PAGE_KEY_HREF, routeHref } from "@/lib/constants";

/** Поле «Куда ведёт» из админки (src/fields/link.ts). */
export interface CmsLink {
  type?: "route" | "page" | "url" | null;
  route?: string | null;
  page?: number | Page | null;
  url?: string | null;
}

/** Адрес текстовой страницы: встроенная по своему ключу, новая по разделу и адресу. */
export function pageHref(page: Pick<Page, "key" | "slug" | "section">): string | null {
  if (page.key) return PAGE_KEY_HREF[page.key] ?? null;
  if (!page.slug) return null;
  const section = page.section && typeof page.section === "object" ? (page.section as SiteSection) : null;
  return section ? `/${section.slug}/${page.slug}` : `/${page.slug}`;
}

/** Адрес ссылки на сайте или null, если ссылка не заполнена (такой пункт не показывается). */
export function linkHref(link: CmsLink | null | undefined): string | null {
  if (!link) return null;
  switch (link.type ?? "route") {
    case "route":
      return routeHref(link.route);
    case "page":
      return link.page && typeof link.page === "object" && link.page.published !== false ? pageHref(link.page) : null;
    case "url":
      return link.url?.trim() || null;
    default:
      return null;
  }
}

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

interface Linkable {
  label: string;
  link?: CmsLink | null;
  hidden?: boolean | null;
}

/** Видимые пункты с готовыми адресами: скрытые и пустые отбрасываются. */
export function visibleLinks<T extends Linkable>(items: readonly T[] | null | undefined): (T & { href: string })[] {
  return (items ?? []).flatMap((item) => {
    const href = item.hidden ? null : linkHref(item.link);
    return href ? [{ ...item, href }] : [];
  });
}
