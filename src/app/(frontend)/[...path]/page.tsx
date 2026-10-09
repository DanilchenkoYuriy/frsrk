import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageById, type Page } from "@/lib/cms";
import { getSiteTree } from "@/lib/layout";
import { PageView, pageMeta } from "@/components/page/PageView";

/**
 * Страницы, созданные в «Страницы сайта»: адрес собирается из адреса раздела и адреса страницы.
 * Встроенные адреса (/calendar, /about/history и другие) обрабатываются раньше и сюда не попадают.
 */
type Resolved = { page: Page } | { redirectTo: string } | null;

async function resolve(path: string[]): Promise<Resolved> {
  const tree = await getSiteTree();
  const node = tree.byHref(`/${path.map(decodeURIComponent).join("/")}`);
  if (!node || !tree.hrefOf(node.id)) return null;
  const landing = tree.landing(node);
  if (landing && landing.id !== node.id) return { redirectTo: landing.href as string };
  const page = await getPageById(node.id);
  return page ? { page } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const found = await resolve((await params).path);
  return found && "page" in found ? pageMeta(found.page, { title: found.page.title }) : {};
}

export default async function CustomPage({ params }: { params: Promise<{ path: string[] }> }) {
  const found = await resolve((await params).path);
  if (!found) notFound();
  if ("redirectTo" in found) redirect(found.redirectTo);
  return <PageView page={found.page} fallback={{ title: found.page.title }} />;
}
