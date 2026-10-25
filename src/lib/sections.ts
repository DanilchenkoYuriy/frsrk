import { populated, type Municipality, type Section } from "@/lib/cms";
import { DISCIPLINES, labelOf } from "@/lib/constants";
import { telHref } from "@/lib/site";
import type { SectionView } from "@/components/sections/SectionsFinder";

/** Секция в том виде, в каком её показывают карта и страницы городов. */
export function toSectionView(s: Section): SectionView {
  const m = populated<Municipality>(s.municipality);
  const ages = s.ageFrom && s.ageTo ? `от ${s.ageFrom} до ${s.ageTo} лет` : s.ageFrom ? `от ${s.ageFrom} лет` : s.ageTo ? `до ${s.ageTo} лет` : undefined;
  return {
    id: s.id,
    title: s.title,
    citySlug: m?.slug ?? "",
    cityName: m?.name ?? "",
    organization: s.organization ?? undefined,
    address: [s.locality, s.address].filter(Boolean).join(", "),
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
}
