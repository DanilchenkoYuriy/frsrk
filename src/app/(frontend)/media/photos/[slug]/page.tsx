import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGallery, populated, type Media } from "@/lib/cms";
import { formatDate } from "@/lib/dates";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { Picture } from "@/components/ui/Picture";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGallery(slug);
  return g ? { title: g.title, description: g.description ?? undefined } : {};
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const g = await getGallery(slug);
  if (!g) notFound();
  return (
    <>
      <PageHead slogan={SLOGANS.media} title={g.title} lead={g.description ?? formatDate(g.date)} crumbs={[{ label: "Медиа", href: "/media" }, { label: g.title }]} />
      <div className="page">
        <div className="container">
          <div className="gallery" role="list">
            {(g.photos ?? []).map((p) => {
              const m = populated<Media>(p.image);
              if (!m?.url) return null;
              const full = m.sizes?.wide?.url ?? m.url;
              return (
                <figure key={p.id ?? m.id} role="listitem">
                  <a href={full} target="_blank" rel="noopener noreferrer" aria-label={p.caption ?? m.alt}>
                    <Picture media={m} sizes="(min-width: 900px) 280px, 50vw" />
                  </a>
                  {p.caption ? <figcaption>{p.caption}</figcaption> : null}
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
