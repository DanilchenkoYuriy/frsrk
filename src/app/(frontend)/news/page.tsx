import type { Metadata } from "next";
import Link from "next/link";
import { getNews, populated, type Media } from "@/lib/cms";
import { formatDate } from "@/lib/dates";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { Picture } from "@/components/ui/Picture";
import { Empty } from "@/components/ui/Wip";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости Федерации роуп скиппинга (спортивной скакалки) Республики Крым.",
};

export default async function NewsPage() {
  const news = await getNews(100);
  return (
    <>
      <PageHead slogan={SLOGANS.news} title="Новости" lead="Сообщения федерации: соревнования, итоги, обучение." crumbs={[{ label: "Новости" }]} />
      <div className="page">
        <div className="container">
          {news.length === 0 ? (
            <Empty>Новостей пока нет.</Empty>
          ) : (
            <div className="news-grid">
              {news.map((n) => (
                <Link key={n.id} href={`/news/${n.slug}`} className="news-card">
                  {populated<Media>(n.cover) ? (
                    <div className="news-card__media">
                      <Picture media={n.cover} sizes="(min-width: 900px) 360px, 100vw" />
                    </div>
                  ) : null}
                  <span className="news-card__date">{formatDate(n.publishedAt)}</span>
                  <h2 className="news-card__title">{n.title}</h2>
                  <p className="news-card__text">{n.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
