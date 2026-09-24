import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import { CONTENT_TAG } from "@/hooks/revalidate";
import type {
  AudioTrack,
  Document as DocumentDoc,
  Event,
  Gallery,
  Media,
  Municipality,
  News,
  Page,
  Person,
  RankingEntry,
  Section,
  SiteSetting,
  Video,
} from "@/payload-types";
import type { DocumentCategory } from "@/lib/constants";

export type {
  AudioTrack,
  DocumentDoc,
  Event,
  Gallery,
  Media,
  Municipality,
  News,
  Page,
  Person,
  RankingEntry,
  Section,
  SiteSetting,
  Video,
};

/** Кешируем запросы к базе; кеш сбрасывается при любой правке в админке (см. hooks/revalidate.ts). */
function cached<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, ["cms", name], { tags: [CONTENT_TAG], revalidate: 300 });
}

const payload = () => getPayload({ config });

/** Публичное чтение: правила доступа применяются, черновики не попадают на сайт. */
const publicRead = { overrideAccess: false as const };

export const getSettings = cached("settings", async (): Promise<SiteSetting> => {
  const p = await payload();
  return p.findGlobal({ slug: "site-settings", depth: 1, ...publicRead });
});

export const getPage = cached("page", async (key: Page["key"]): Promise<Page | null> => {
  const p = await payload();
  const res = await p.find({ collection: "pages", where: { key: { equals: key } }, limit: 1, depth: 1, ...publicRead });
  return res.docs[0] ?? null;
});

export const getEvents = cached("events", async (): Promise<Event[]> => {
  const p = await payload();
  const res = await p.find({ collection: "events", sort: "dateFrom", limit: 500, depth: 2, ...publicRead });
  return res.docs;
});

export const getEvent = cached("event", async (slug: string): Promise<Event | null> => {
  const p = await payload();
  const res = await p.find({ collection: "events", where: { slug: { equals: slug } }, limit: 1, depth: 2, ...publicRead });
  return res.docs[0] ?? null;
});

export const getNews = cached("news", async (limit: number): Promise<News[]> => {
  const p = await payload();
  const res = await p.find({ collection: "news", sort: "-publishedAt", limit, depth: 1, ...publicRead });
  return res.docs;
});

export const getNewsItem = cached("news-item", async (slug: string): Promise<News | null> => {
  const p = await payload();
  const res = await p.find({ collection: "news", where: { slug: { equals: slug } }, limit: 1, depth: 2, ...publicRead });
  return res.docs[0] ?? null;
});

export const getDocuments = cached("documents", async (): Promise<DocumentDoc[]> => {
  const p = await payload();
  const res = await p.find({ collection: "documents", sort: "order", limit: 1000, depth: 0, ...publicRead });
  return res.docs;
});

export const getDocumentsByCategory = async (category: DocumentCategory) => (await getDocuments()).filter((d) => d.category === category);

export const getAudioTracks = cached("audio", async (): Promise<AudioTrack[]> => {
  const p = await payload();
  const res = await p.find({ collection: "audio-tracks", sort: "order", limit: 200, depth: 0, ...publicRead });
  return res.docs;
});

export const getMunicipalities = cached("municipalities", async (): Promise<Municipality[]> => {
  const p = await payload();
  const res = await p.find({ collection: "municipalities", sort: "name", limit: 100, depth: 2, ...publicRead });
  return res.docs;
});

export const getSections = cached("sections", async (): Promise<Section[]> => {
  const p = await payload();
  const res = await p.find({ collection: "sections", sort: "title", limit: 1000, depth: 1, ...publicRead });
  return res.docs;
});

export const getPeople = cached("people", async (): Promise<Person[]> => {
  const p = await payload();
  const res = await p.find({ collection: "people", sort: "order", limit: 500, depth: 1, ...publicRead });
  return res.docs;
});

export const getGalleries = cached("galleries", async (): Promise<Gallery[]> => {
  const p = await payload();
  const res = await p.find({ collection: "galleries", sort: "-date", limit: 200, depth: 1, ...publicRead });
  return res.docs;
});

export const getGallery = cached("gallery", async (slug: string): Promise<Gallery | null> => {
  const p = await payload();
  const res = await p.find({ collection: "galleries", where: { slug: { equals: slug } }, limit: 1, depth: 2, ...publicRead });
  return res.docs[0] ?? null;
});

export const getRanking = cached("ranking", async (): Promise<RankingEntry[]> => {
  const p = await payload();
  const res = await p.find({ collection: "ranking-entries", sort: "-points", limit: 2000, depth: 1, ...publicRead });
  return res.docs;
});

export const getVideos = cached("videos", async (): Promise<Video[]> => {
  const p = await payload();
  const res = await p.find({ collection: "videos", sort: "-date", limit: 200, depth: 1, ...publicRead });
  return res.docs;
});

/** Достаёт объект из поля-связи, которое может быть числом (не загружено) или документом. */
export function populated<T extends object>(value: number | string | T | null | undefined): T | null {
  return value && typeof value === "object" ? value : null;
}
