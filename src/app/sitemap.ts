import type { MetadataRoute } from "next";
import { getEvents, getGalleries, getNews } from "@/lib/cms";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC = ["/", "/sections", "/calendar", "/news", "/documents", "/documents/rules", "/documents/audio", "/participants/coaches", "/participants/judges", "/participants/parents", "/participants/ranking", "/participants/antidoping", "/media", "/about", "/about/leadership", "/about/requisites", "/about/history", "/contacts", "/legal/privacy", "/legal/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news, galleries] = await Promise.all([getEvents(), getNews(500), getGalleries()]);
  return [
    ...STATIC.map((p) => ({ url: absoluteUrl(p) })),
    ...events.map((e) => ({ url: absoluteUrl(`/calendar/${e.slug}`), lastModified: e.updatedAt })),
    ...news.map((n) => ({ url: absoluteUrl(`/news/${n.slug}`), lastModified: n.updatedAt })),
    ...galleries.map((g) => ({ url: absoluteUrl(`/media/photos/${g.slug}`), lastModified: g.updatedAt })),
  ];
}
