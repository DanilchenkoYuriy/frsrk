import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsItem, populated, type Media } from "@/lib/cms";
import { formatDate } from "@/lib/dates";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { Picture } from "@/components/ui/Picture";
import { RichText } from "@/components/ui/RichText";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsItem(slug);
  if (!item) return {};
  const cover = populated<Media>(item.cover);
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { type: "article", title: item.title, description: item.excerpt, images: cover?.url ? [{ url: cover.url }] : undefined },
  };
}

export default async function NewsItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsItem(slug);
  if (!item) notFound();
  const gallery = (item.gallery ?? []).map((g) => populated<Media>(g.image)).filter((m): m is Media => Boolean(m));

  return (
    <>
      <PageHead slogan={SLOGANS.news} title={item.title} lead={formatDate(item.publishedAt)} crumbs={[{ label: "Новости", href: "/news" }, { label: item.title }]} />
      <div className="page">
        <div className="container" style={{ display: "grid", gap: 40 }}>
          {populated<Media>(item.cover) ? (
            <div style={{ maxWidth: 900 }}>
              <Picture media={item.cover} sizes="(min-width: 960px) 900px, 100vw" priority style={{ borderRadius: 14, width: "100%", height: "auto" }} />
            </div>
          ) : null}
          <p className="prose" style={{ fontSize: "var(--step-1)", fontWeight: 500 }}>
            {item.excerpt}
          </p>
          <RichText data={item.body} />
          {gallery.length > 0 ? (
            <div className="gallery" role="list" aria-label="Фотографии">
              {gallery.map((m) => (
                <figure key={m.id} role="listitem">
                  <Picture media={m} sizes="(min-width: 900px) 280px, 50vw" />
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
