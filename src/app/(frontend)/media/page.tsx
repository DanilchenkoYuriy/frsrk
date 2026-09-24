import type { Metadata } from "next";
import Link from "next/link";
import { getGalleries, getPage, getVideos, populated, type Media } from "@/lib/cms";
import { formatDate } from "@/lib/dates";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { Picture } from "@/components/ui/Picture";
import { RichText } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";
import { Wip } from "@/components/ui/Wip";

export const metadata: Metadata = {
  title: "Медиа",
  description: "Фотоальбомы и видео с соревнований и мероприятий ФРСРК.",
};

export default async function MediaPage() {
  const [galleries, videos, page] = await Promise.all([getGalleries(), getVideos(), getPage("media")]);
  const empty = galleries.length === 0 && videos.length === 0;

  const single = galleries.length === 1 ? galleries[0] : null;
  const singlePhotos = (single?.photos ?? []).map((ph) => ({ m: populated<Media>(ph.image), caption: ph.caption })).filter((x): x is { m: Media; caption: string | null | undefined } => Boolean(x.m?.url));

  // Один альбом: показываем его фотографии сразу, без лишнего клика
  const photosTab = single ? (
    <div className="gallery">
      {singlePhotos.map(({ m, caption }) => (
        <figure key={m.id}>
          <a href={m.sizes?.wide?.url ?? (m.url as string)} target="_blank" rel="noopener noreferrer" aria-label={caption ?? m.alt}>
            <Picture media={m} sizes="(min-width: 900px) 300px, 50vw" />
          </a>
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  ) : (
    <div className="news-grid">
      {galleries.map((g) => (
        <Link key={g.id} href={`/media/photos/${g.slug}`} className="news-card">
          <div className="news-card__media">
            <Picture media={g.cover ?? g.photos?.[0]?.image} sizes="(min-width: 900px) 400px, 100vw" />
          </div>
          <span className="news-card__date">
            {formatDate(g.date)} · {g.photos?.length ?? 0} фото
          </span>
          <h3 className="news-card__title">{g.title}</h3>
        </Link>
      ))}
    </div>
  );

  const videosTab = (
    <ul className="video-list">
      {videos.map((v) => (
        <li className="video-item" key={v.id}>
          {v.url ? (
            <video controls preload="none" poster={populated<Media>(v.poster)?.url ?? undefined} src={v.url} />
          ) : (
            <a href={v.externalUrl ?? "#"} target="_blank" rel="noopener noreferrer">
              {populated<Media>(v.poster) ? <Picture media={v.poster} className="video-item__poster" sizes="360px" /> : <div className="video-item__poster" />}
            </a>
          )}
          <p className="video-item__title">
            {v.title}
            {!v.url && v.externalUrl ? (
              <>
                {" "}
                <a href={v.externalUrl} target="_blank" rel="noopener noreferrer">
                  Смотреть
                </a>
              </>
            ) : null}
          </p>
          {v.date ? <p className="news-card__date">{formatDate(v.date)}</p> : null}
        </li>
      ))}
    </ul>
  );

  const tabs = [
    ...(galleries.length ? [{ id: "photo", label: single ? `Фото · ${singlePhotos.length}` : `Фотоальбомы · ${galleries.length}`, content: photosTab }] : []),
    ...(videos.length ? [{ id: "video", label: `Видео · ${videos.length}`, content: videosTab }] : []),
  ];

  return (
    <>
      <PageHead banner="media" slogan={SLOGANS.media} title="Медиа" lead={page?.lead ?? "Фотографии и видео с мероприятий федерации."} crumbs={[{ label: "Медиа" }]} />
      <div className="page">
        <div className="container">
          <RichText data={page?.body} />
          {empty ? <Wip title="Фото и видео скоро появятся" /> : tabs.length === 1 ? tabs[0].content : <Tabs tabs={tabs} label="Медиа" />}
        </div>
      </div>
    </>
  );
}
