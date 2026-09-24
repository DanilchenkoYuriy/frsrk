import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPage, type Page } from "@/lib/cms";
import { PageHead } from "@/components/ui/PageHead";
import { PAGE_SLOGANS } from "@/config/slogans";
import { RichText, hasContent, splitByHeading } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";
import { Wip } from "@/components/ui/Wip";
import { SectionPage } from "@/components/section/SectionPage";
import type { SectionKey } from "@/config/sections";

interface Props {
  pageKey: Page["key"];
  fallbackTitle: string;
  /** Раздел с боковым меню (Участникам, О федерации) и адрес страницы в нём */
  section?: { key: SectionKey; href: string };
  after?: ReactNode;
  /** Длинный текст делится на вкладки по заголовкам. Для юридических текстов выключено. */
  tabs?: boolean;
}

/** Общий шаблон текстовых разделов: заголовок и текст берутся из админки. */
export async function TextPage({ pageKey, fallbackTitle, section, after, tabs = true }: Props) {
  const page = await getPage(pageKey);
  const title = page?.title ?? fallbackTitle;
  const filled = Boolean(page && hasContent(page.body as never));
  const { intro, sections } = filled && tabs ? splitByHeading(page!.body) : { intro: null, sections: [] };
  const useTabs = sections.length >= 3;

  const content = (
    <>
      {!filled ? (
        <Wip />
      ) : useTabs ? (
        <>
          {intro ? <RichText data={intro} /> : null}
          <Tabs label={title} tabs={sections.map((s, i) => ({ id: `s${i}`, label: s.title, content: <RichText data={s.data} /> }))} />
        </>
      ) : (
        <RichText data={page!.body} />
      )}
      {after}
    </>
  );

  if (section) {
    return (
      <SectionPage section={section.key} href={section.href} title={title} lead={page?.lead} slogan={PAGE_SLOGANS[pageKey]}>
        {content}
      </SectionPage>
    );
  }

  return (
    <>
      <PageHead title={title} lead={page?.lead} crumbs={[{ label: title }]} slogan={PAGE_SLOGANS[pageKey]} />
      <div className="page">
        <div className="container">{content}</div>
      </div>
    </>
  );
}

export async function textPageMetadata(pageKey: Page["key"], fallbackTitle: string): Promise<Metadata> {
  const page = await getPage(pageKey);
  return { title: page?.title ?? fallbackTitle, description: page?.lead ?? undefined };
}
