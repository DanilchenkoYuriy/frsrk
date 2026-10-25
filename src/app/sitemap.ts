import type { MetadataRoute } from "next";
import { getEvents, getGalleries, getNews, getSections, populated, type Municipality } from "@/lib/cms";
import { getSiteTree } from "@/lib/layout";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC = ["/", "/sections", "/calendar", "/news", "/documents", "/documents/rules", "/documents/audio", "/participants/coaches", "/participants/judges", "/participants/parents", "/participants/ranking", "/participants/antidoping", "/media", "/about", "/about/leadership", "/about/requisites", "/about/history", "/contacts", "/legal/privacy", "/legal/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news, galleries, tree, sections] = await Promise.all([getEvents(), getNews(500), getGalleries(), getSiteTree(), getSections()]);
  // Страницы городов и районов, где есть секции
  const cities = [...new Set(sections.map((s) => populated<Municipality>(s.municipality)?.slug).filter(Boolean))];
  return [
    ...STATIC.map((p) => ({ url: absoluteUrl(p) })),
    ...cities.map((slug) => ({ url: absoluteUrl(`/sections/${slug}`) })),
    ...events.map((e) => ({ url: absoluteUrl(`/calendar/${e.slug}`), lastModified: e.updatedAt })),
    ...news.map((n) => ({ url: absoluteUrl(`/news/${n.slug}`), lastModified: n.updatedAt })),
    // Новые страницы из «Страницы сайта» (встроенные уже в списке выше)
    ...[...tree.nodes.values()].flatMap((n) => {
      const href = n.kind === "custom" ? tree.hrefOf(n.id) : null;
      return href && tree.landing(n)?.id === n.id ? [{ url: absoluteUrl(href) }] : [];
    }),
    ...galleries.map((g) => ({ url: absoluteUrl(`/media/photos/${g.slug}`), lastModified: g.updatedAt })),
  ];
}
