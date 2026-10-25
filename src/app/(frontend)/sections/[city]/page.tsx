import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipalities, getSections, populated, type Person } from "@/lib/cms";
import { toSectionView } from "@/lib/sections";
import { absoluteUrl, telHref } from "@/lib/site";
import { PageView } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";
import { SectionCard, sectionsWord } from "@/components/sections/SectionCard";
import { JsonLd } from "@/components/ui/JsonLd";

type Props = { params: Promise<{ city: string }> };

/** Город или район и его секции. Страница есть только там, где секции действительно открыты. */
async function load(slug: string) {
  const [municipalities, sections] = await Promise.all([getMunicipalities(), getSections()]);
  const municipality = municipalities.find((m) => m.slug === slug);
  if (!municipality) return null;
  const views = sections.map(toSectionView).filter((s) => s.citySlug === slug);
  return views.length ? { municipality, views } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = await load(city);
  if (!data) return {};
  const { municipality, views } = data;
  return {
    title: `${municipality.name}: секции спортивной скакалки`,
    description: `${municipality.name}: ${views.length} ${sectionsWord(views.length)} по роуп скиппингу (спортивной скакалке). Адреса, тренеры, расписание и телефоны.`,
    alternates: { canonical: absoluteUrl(`/sections/${city}`) },
  };
}

export default async function CitySectionsPage({ params }: Props) {
  const { city } = await params;
  const data = await load(city);
  if (!data) notFound();
  const { municipality, views } = data;
  const rep = populated<Person>(municipality.representative);

  return (
    <PageView
      banner="sections"
      trail={[{ label: "Найти секцию", href: "/sections" }]}
      crumb={municipality.name}
      fallback={{
        title: `${municipality.name}: секции спортивной скакалки`,
        lead: `${views.length} ${sectionsWord(views.length)} по роуп скиппингу (спортивной скакалке). Позвоните тренеру, чтобы записаться на занятие.`,
        slogan: SLOGANS.sections,
      }}
      builtin={
        <>
          <JsonLd
            data={{
              "@type": "ItemList",
              name: `Секции спортивной скакалки: ${municipality.name}`,
              itemListElement: views.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "SportsActivityLocation",
                  name: s.title,
                  address: { "@type": "PostalAddress", addressLocality: s.cityName, streetAddress: s.address, addressRegion: "Республика Крым", addressCountry: "RU" },
                  ...(s.phone ? { telephone: s.phone } : {}),
                  sport: "Роуп скиппинг (спортивная скакалка)",
                },
              })),
            }}
          />
          <ul style={{ display: "grid", gap: 12 }}>
            {views.map((s) => (
              <SectionCard key={s.id} s={s} showCity={false} />
            ))}
          </ul>
          {rep ? (
            <div className="aside-card" style={{ marginTop: 32 }}>
              <h2 className="aside-card__title">Представитель федерации</h2>
              <p>
                <b>{rep.name}</b>
              </p>
              <p>{rep.position}</p>
              {rep.phone ? (
                <p style={{ marginTop: 8 }}>
                  <a href={telHref(rep.phone)}>{rep.phone}</a>
                </p>
              ) : null}
            </div>
          ) : null}
          <p style={{ marginTop: 32 }}>
            <Link className="btn btn--line" href={`/sections?city=${city}`}>
              Все секции на карте Крыма
            </Link>
          </p>
        </>
      }
    />
  );
}
