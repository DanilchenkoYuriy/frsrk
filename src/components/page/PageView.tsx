import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPage, getPageById, populated, type Media, type Page, type SiteSetting } from "@/lib/cms";
import type { PageKind } from "@/lib/constants";
import { getSiteTree } from "@/lib/layout";
import { PageHead } from "@/components/ui/PageHead";
import { Wip } from "@/components/ui/Wip";
import { SectionShell } from "@/components/section/SectionShell";
import { DocumentsShell } from "@/components/documents/DocumentsPage";
import { BlockList, WideBlocks } from "@/components/blocks/RenderBlocks";

type BannerKey = keyof NonNullable<SiteSetting["banners"]>;

interface Fallback {
  title: string;
  lead?: string | null;
  slogan?: string;
  description?: string;
}

interface Props {
  /** Встроенная страница по типу или уже загруженная обычная страница */
  kind?: PageKind;
  page?: Page | null;
  /** Что показать, если страницы ещё нет в админке */
  fallback: Fallback;
  /** Картинка полосы из «Данные федерации → Полосы заголовков» */
  banner?: BannerKey;
  /** Основное содержимое встроенной страницы: встаёт на место блока «Основное содержимое страницы» */
  builtin?: ReactNode;
  /** Раздел «Документы»: свой список слева с поиском */
  documents?: { active: string; q?: string };
  /** Последняя хлебная крошка, если она отличается от заголовка (например, «Правила вида спорта») */
  crumb?: string;
  /** Промежуточные крошки для страницы без записи в админке (например, город внутри «Найти секцию») */
  trail?: { label: string; href: string }[];
}

/**
 * Любая страница сайта: полоса заголовка, меню раздела слева (если страница в разделе) и блоки из админки.
 * Главная выводит блоки во всю ширину, без полосы заголовка.
 */
export async function PageView({ kind, page: given, fallback, banner, builtin, documents, crumb, trail = [] }: Props) {
  const [tree, loaded] = await Promise.all([getSiteTree(), given ? Promise.resolve(given) : kind ? getPage(kind) : Promise.resolve(null)]);
  const page = loaded;
  // Пока страницы нет в админке, показываем основное содержимое как раньше
  const blocks = page?.layout?.length ? page.layout : [{ blockType: "builtin" as const, id: "builtin" }];

  if ((page?.kind ?? kind) === "home") return <WideBlocks blocks={blocks as NonNullable<Page["layout"]>} tree={tree} builtin={builtin} />;

  const node = page ? tree.byId(page.id) : kind ? tree.byKind(kind) : null;
  const root = node ? tree.rootOf(node) : null;
  const ancestors = node ? tree.ancestors(node) : [];

  const title = page?.title ?? fallback.title;
  const lead = page ? page.lead : fallback.lead;
  const slogan = page?.slogan || fallback.slogan;
  const rootPage = root && root !== node ? root : null;
  const image = populated<Media>(page?.banner) ?? (rootPage ? await bannerOf(rootPage.id) : null);

  const crumbs = [
    ...ancestors.map((a) => ({ label: a.label, href: (tree.landing(a) ?? a).href ?? undefined })),
    ...trail,
    { label: crumb ?? title },
  ];

  // Пустая страница честно говорит, что раздел готовится
  const empty = !blocks.some((b) => !(b as { hidden?: boolean | null }).hidden && (b.blockType !== "builtin" || builtin));
  const content = empty ? <Wip /> : <BlockList blocks={blocks} tree={tree} builtin={builtin} />;
  const side = root ? tree.sideMenu(root) : [];
  const active = documents?.active ?? node?.href ?? "";

  let body: ReactNode;
  if (documents || root?.kind === "documents") {
    body = (
      <DocumentsShell active={active} q={documents?.q} tree={tree} root={root}>
        {content}
      </DocumentsShell>
    );
  } else if (root && side.length > 0 && (side.length > 1 || side[0].href !== node?.href)) {
    body = (
      // Страница внутри пункта (например, схема внутри «Пособий») подсвечивает свой пункт
      <SectionShell title={root.label} items={side.map((i) => ({ ...i, active: i.href === active || active.startsWith(`${i.href}/`) }))}>
        {content}
      </SectionShell>
    );
  } else {
    body = content;
  }

  return (
    <>
      <PageHead banner={banner} image={image} title={title} lead={lead} crumbs={crumbs} slogan={slogan ?? undefined} />
      <div className="page">
        <div className="container">{body}</div>
      </div>
    </>
  );
}

/** Картинка полосы у раздела: страницы внутри раздела берут её, если своей нет. */
async function bannerOf(id: number): Promise<Media | null> {
  const page = await getPageById(id);
  return populated<Media>(page?.banner);
}

/** Заголовок и описание страницы для поисковиков. */
export async function pageMetadata(kind: PageKind, fallback: Fallback): Promise<Metadata> {
  const page = await getPage(kind);
  return pageMeta(page, fallback);
}

export function pageMeta(page: Page | null, fallback: Fallback): Metadata {
  return {
    title: page?.metaTitle || page?.title || fallback.title,
    description: page?.metaDescription || page?.lead || fallback.description || fallback.lead || undefined,
  };
}
