import type { Metadata } from "next";
import { getMunicipalities, getSections, populated, type Municipality, type Person } from "@/lib/cms";
import { DISCIPLINES, labelOf, MUNICIPALITY_KINDS } from "@/lib/constants";
import { telHref } from "@/lib/site";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { SectionsFinder, type MunicipalityView, type SectionView } from "@/components/sections/SectionsFinder";

export const metadata: Metadata = {
  title: "Найти секцию",
  description: "Секции по роуп скиппингу (спортивной скакалке) в муниципальных образованиях Республики Крым: адреса, тренеры, расписание.",
};

export default async function SectionsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const [municipalities, sections] = await Promise.all([getMunicipalities(), getSections()]);

  const counts = new Map<string, number>();
  const views: SectionView[] = sections.map((s) => {
    const m = populated<Municipality>(s.municipality);
    if (m?.slug) counts.set(m.slug, (counts.get(m.slug) ?? 0) + 1);
    const ages = s.ageFrom && s.ageTo ? `от ${s.ageFrom} до ${s.ageTo} лет` : s.ageFrom ? `от ${s.ageFrom} лет` : s.ageTo ? `до ${s.ageTo} лет` : undefined;
    return {
      id: s.id,
      title: s.title,
      citySlug: m?.slug ?? "",
      cityName: m?.name ?? "",
      organization: s.organization ?? undefined,
      address: s.address,
      coach: s.coach ?? undefined,
      ages,
      schedule: s.schedule ?? undefined,
      price: s.isFree ? "Занятия бесплатные" : s.priceNote ?? undefined,
      phone: s.phone ?? undefined,
      phoneHref: s.phone ? telHref(s.phone) : undefined,
      messengerUrl: s.messengerUrl ?? undefined,
      disciplines: (s.disciplines ?? []).map((d) => labelOf(DISCIPLINES, d)),
      description: s.description ?? undefined,
    };
  });

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

  return (
    <>
      <PageHead slogan={SLOGANS.sections} title="Найти секцию" lead="Выберите муниципальное образование на карте или найдите секцию через поиск. В карточке есть телефон тренера и маршрут." crumbs={[{ label: "Найти секцию" }]} />
      <div className="page">
        <div className="container">
          <SectionsFinder municipalities={items} sections={views} initialCity={city ?? null} />
        </div>
      </div>
    </>
  );
}
