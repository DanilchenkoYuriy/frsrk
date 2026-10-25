import Link from "next/link";
import { getMunicipalities, getSections, populated, type Person } from "@/lib/cms";
import { labelOf, MUNICIPALITY_KINDS } from "@/lib/constants";
import { toSectionView } from "@/lib/sections";
import { telHref } from "@/lib/site";
import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";
import { SectionsFinder, type MunicipalityView, type SectionView } from "@/components/sections/SectionsFinder";
import { sectionsWord } from "@/components/sections/SectionCard";

export const generateMetadata = () => pageMetadata("sections", { title: "Найти секцию", description: "Секции по роуп скиппингу (спортивной скакалке) в муниципальных образованиях Республики Крым: адреса, тренеры, расписание." });

export default async function SectionsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const [municipalities, sections] = await Promise.all([getMunicipalities(), getSections()]);

  const counts = new Map<string, number>();
  const views: SectionView[] = sections.map(toSectionView);
  for (const v of views) if (v.citySlug) counts.set(v.citySlug, (counts.get(v.citySlug) ?? 0) + 1);

  const items: MunicipalityView[] = municipalities.map((m) => {
    const rep = populated<Person>(m.representative);
    return {
      slug: m.slug as string,
      name: m.name,
      kind: labelOf(MUNICIPALITY_KINDS, m.kind),
      count: counts.get(m.slug as string) ?? 0,
      rep: rep ? { name: rep.name, position: rep.position, phone: rep.phone ?? undefined, phoneHref: rep.phone ? telHref(rep.phone) : undefined } : undefined,
    };
  });

  const withSections = items.filter((m) => m.count > 0);

  return (
      <PageView
        kind="sections"
        banner="sections"
        fallback={{ title: "Найти секцию", lead: "Выберите муниципальное образование на карте или найдите секцию через поиск. В карточке есть телефон тренера и маршрут.", slogan: SLOGANS.sections }}
        builtin={
          <>
      <SectionsFinder municipalities={items} sections={views} initialCity={city ?? null} />
      {withSections.length ? (
        <nav aria-labelledby="by-city" style={{ marginTop: 40 }}>
          <h2 className="h3" id="by-city" style={{ marginBottom: 16 }}>
            Секции по городам и районам
          </h2>
          <ul className="city-links">
            {withSections.map((m) => (
              <li key={m.slug}>
                <Link href={`/sections/${m.slug}`}>
                  {m.name}: {m.count} {sectionsWord(m.count)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
          </>
        }
      />
  );
}
