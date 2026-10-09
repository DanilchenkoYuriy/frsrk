import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageBySlug, getSiteSection, type Page, type SiteSection } from "@/lib/cms";
import { TextPage } from "@/components/ui/TextPage";
import { sectionItems } from "@/components/section/SectionPage";

/**
 * Новые разделы и страницы, созданные в админке:
 * /раздел → первый пункт раздела, /раздел/страница → страница внутри раздела, /страница → отдельная страница.
 * Встроенные адреса сайта (/calendar, /about/history и другие) обрабатываются раньше, сюда не попадают.
 */
async function resolve(path: string[]): Promise<{ page: Page; section: SiteSection | null } | { redirectTo: string } | null> {
  if (path.length === 1) {
    const [slug] = path;
    const section = await getSiteSection(slug);
    if (section) {
      const first = sectionItems(section).find((i) => i.href !== `/${slug}`);
      return first ? { redirectTo: first.href } : null;
    }
    const page = await getPageBySlug(slug);
    return page && !page.section ? { page, section: null } : null;
  }
  if (path.length === 2) {
    const [sectionSlug, slug] = path;
    const page = await getPageBySlug(slug);
    const section = page?.section && typeof page.section === "object" ? page.section : null;
    return page && section?.slug === sectionSlug ? { page, section } : null;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const found = await resolve((await params).path.map(decodeURIComponent));
  if (!found || "redirectTo" in found) return {};
  return { title: found.page.title, description: found.page.lead ?? undefined };
}

export default async function CustomPage({ params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.map(decodeURIComponent);
  const found = await resolve(path);
  if (!found) notFound();
  if ("redirectTo" in found) redirect(found.redirectTo);
  const { page, section } = found;
  return <TextPage page={page} fallbackTitle={page.title} section={section ? { key: section.slug, href: `/${path.join("/")}` } : undefined} />;
}
