import type { ReactNode } from "react";
import { getSiteSection, populated, type Media, type SiteSection, type SiteSetting } from "@/lib/cms";
import { visibleLinks } from "@/lib/links";
import { PageHead } from "@/components/ui/PageHead";
import { SectionShell } from "@/components/section/SectionShell";

type BannerKey = keyof NonNullable<SiteSetting["banners"]>;
const BANNERS: readonly string[] = ["participants", "about"] satisfies BannerKey[];

interface Props {
  /** Адрес раздела из «Структура сайта → Разделы с боковым меню»: about, participants или новый */
  section: string | SiteSection;
  /** Адрес текущей страницы: по нему подсвечивается пункт слева */
  href: string;
  title: string;
  lead?: string | null;
  slogan?: string | null;
  children: ReactNode;
}

/** Пункты раздела слева с готовыми адресами. Скрытые пункты не показываются. */
export const sectionItems = (section: SiteSection) => visibleLinks(section.items).map(({ label, href }) => ({ label, href }));

/** Страница раздела с боковым меню: полоса заголовка, слева пункты, справа содержимое. */
export async function SectionPage({ section, href, title, lead, slogan, children }: Props) {
  const config = typeof section === "string" ? await getSiteSection(section) : section;
  const slug = typeof section === "string" ? section : section.slug;
  const banner = BANNERS.includes(slug) ? (slug as BannerKey) : undefined;
  const items = config ? sectionItems(config) : [];
  const current = items.find((i) => i.href === href);
  const crumbs = config
    ? [{ label: config.title, href: items[0]?.href }, ...(current && current.label !== config.title ? [{ label: current.label }] : [])]
    : [{ label: title }];

  return (
    <>
      <PageHead banner={banner} image={populated<Media>(config?.banner)} title={title} lead={lead} crumbs={crumbs} slogan={slogan ?? config?.slogan ?? undefined} />
      <div className="page">
        <div className="container">
          {config && items.length ? (
            <SectionShell title={config.title} items={items.map((i) => ({ ...i, active: i.href === href }))}>
              {children}
            </SectionShell>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
}
