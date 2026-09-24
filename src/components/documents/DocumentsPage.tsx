import type { ReactNode } from "react";
import { getAudioTracks, getDocuments } from "@/lib/cms";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { PageHead } from "@/components/ui/PageHead";
import { SectionShell, type ShellItem } from "@/components/section/SectionShell";

interface Props {
  /** rules-text, all, audio или код раздела документов */
  active: string;
  title: string;
  lead?: string;
  slogan?: string;
  crumbLabel?: string;
  q?: string;
  children: ReactNode;
}

/** Страница раздела «Документы»: слева поиск и пункты со счётчиками, справа содержимое. */
export async function DocumentsPage({ active, title, lead, slogan, crumbLabel, q, children }: Props) {
  const [docs, audio] = await Promise.all([getDocuments(), getAudioTracks()]);
  const items: ShellItem[] = [
    { label: "Правила вида спорта", href: "/documents/rules", tag: "текст", active: active === "rules-text" },
    { label: "Все документы", href: "/documents", count: docs.length, active: active === "all" },
    ...DOCUMENT_CATEGORIES.filter((c) => docs.some((d) => d.category === c.value)).map((c) => ({
      label: c.label,
      href: `/documents?category=${c.value}`,
      count: docs.filter((d) => d.category === c.value).length,
      active: active === c.value,
    })),
    ...(audio.length ? [{ label: "Музыка для соревнований", href: "/documents/audio", count: audio.length, active: active === "audio" }] : []),
  ];

  return (
    <>
      <PageHead banner="documents" title={title} lead={lead} slogan={slogan} crumbs={[{ label: "Документы", href: "/documents" }, ...(crumbLabel ? [{ label: crumbLabel }] : [])]} />
      <div className="page">
        <div className="container">
          <SectionShell
            title="Документы"
            items={items}
            top={
              <form action="/documents" role="search" className="search shell__search">
                <label className="sr-only" htmlFor="doc-q">
                  Поиск по названию
                </label>
                <input id="doc-q" className="search__input" type="search" name="q" defaultValue={q ?? ""} placeholder="Название документа" />
              </form>
            }
          >
            {children}
          </SectionShell>
        </div>
      </div>
    </>
  );
}
