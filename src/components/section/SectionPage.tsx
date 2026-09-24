import type { ReactNode } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { SectionShell } from "@/components/section/SectionShell";
import { SECTIONS, type SectionKey } from "@/config/sections";

interface Props {
  section: SectionKey;
  /** Адрес текущей страницы: по нему подсвечивается пункт слева */
  href: string;
  title: string;
  lead?: string | null;
  slogan?: string;
  children: ReactNode;
}

/** Страница раздела с боковым меню: полоса заголовка, слева пункты, справа содержимое. */
export async function SectionPage({ section, href, title, lead, slogan, children }: Props) {
  const config = SECTIONS[section];
  const current = config.items.find((i) => i.href === href);
  const crumbs = [
    { label: config.title, href: config.items[0].href },
    ...(current && current.label !== config.title ? [{ label: current.label }] : []),
  ];
  return (
    <>
      <PageHead title={title} lead={lead} crumbs={crumbs} slogan={slogan} />
      <div className="page">
        <div className="container">
          <SectionShell title={config.title} items={config.items.map((i) => ({ ...i, active: i.href === href }))}>
            {children}
          </SectionShell>
        </div>
      </div>
    </>
  );
}
