import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPage, type Page } from "@/lib/cms";
import { PageHead } from "@/components/ui/PageHead";
import { PAGE_SLOGANS } from "@/config/slogans";
import { RichText, hasContent, splitByHeading } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";
import { Wip } from "@/components/ui/Wip";
import { SectionPage } from "@/components/section/SectionPage";
import { PageTabs, hasTabs } from "@/components/ui/PageBlocks";

interface Props {
  /** Встроенная страница по ключу или уже загруженная новая страница */
  pageKey?: NonNullable<Page["key"]>;
  page?: Page | null;
  fallbackTitle: string;
  /** Раздел с боковым меню (Участникам, О федерации или новый) и адрес страницы в нём */
  section?: { key: string; href: string };
  after?: ReactNode;
  /** Длинный текст делится на вкладки по заголовкам. Для юридических текстов выключено. */
  tabs?: boolean;
}

/** Общий шаблон текстовых разделов: заголовок и текст берутся из админки. */
export async function TextPage({ pageKey, page: loaded, fallbackTitle, section, after, tabs = true }: Props) {
  const page = loaded ?? (pageKey ? await getPage(pageKey) : null);
  const title = page?.title ?? fallbackTitle;
  const filled = Boolean(page && hasContent(page.body as never));
  const blockTabs = hasTabs(page?.tabs);
  // Если в админке собраны вкладки из блоков, текст страницы идёт целиком над ними и сам не делится
  const { intro, sections } = filled && tabs && !blockTabs ? splitByHeading(page!.body) : { intro: null, sections: [] };
  const useTabs = sections.length >= 3;
  const slogan = pageKey ? PAGE_SLOGANS[pageKey] : undefined;

  const content = (
    <>
      {!filled ? (
        blockTabs ? null : <Wip />
      ) : useTabs ? (
        <>
          {intro ? <RichText data={intro} /> : null}
          <Tabs label={title} tabs={sections.map((s, i) => ({ id: `s${i}`, label: s.title, content: <RichText data={s.data} /> }))} />
        </>
      ) : (
        <RichText data={page!.body} />
      )}
      {blockTabs ? <PageTabs tabs={page!.tabs} label={title} /> : null}
      {after}
    </>
  );

  if (section) {
    return (
      <SectionPage section={section.key} href={section.href} title={title} lead={page?.lead} slogan={slogan}>
        {content}
      </SectionPage>
    );
  }

  return (
    <>
      <PageHead title={title} lead={page?.lead} crumbs={[{ label: title }]} slogan={slogan} />
      <div className="page">
        <div className="container">{content}</div>
      </div>
    </>
  );
}

export async function textPageMetadata(pageKey: NonNullable<Page["key"]>, fallbackTitle: string): Promise<Metadata> {
  const page = await getPage(pageKey);
  return { title: page?.title ?? fallbackTitle, description: page?.lead ?? undefined };
}
