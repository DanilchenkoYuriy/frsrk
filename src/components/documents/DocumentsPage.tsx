import type { ReactNode } from "react";
import { getAudioTracks, getDocuments } from "@/lib/cms";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { SiteTree, TreeNode } from "@/lib/tree";
import { SectionShell, type ShellItem } from "@/components/section/SectionShell";

interface Props {
  /** Адрес текущего пункта: /documents, /documents?category=…, /documents/rules и т. п. */
  active: string;
  q?: string;
  tree: SiteTree;
  root: TreeNode | null;
  children: ReactNode;
}

/**
 * Раздел «Документы»: слева поиск и пункты, справа содержимое.
 * Страницы раздела (правила, музыка, новые) берутся из «Страницы сайта», категории документов появляются сами.
 */
export async function DocumentsShell({ active, q, tree, root, children }: Props) {
  const [docs, audio] = await Promise.all([getDocuments(), getAudioTracks()]);
  const pages = root ? tree.sideMenu(root).filter((i) => i.href !== root.href) : [];
  const kindOf = (href: string) => tree.byHref(href)?.kind;
  const pageItem = (i: { label: string; href: string }): ShellItem | null => {
    const kind = kindOf(i.href);
    if (kind === "audio") return audio.length ? { ...i, count: audio.length, active: active === i.href } : null;
    return { ...i, tag: kind === "rules" ? "текст" : undefined, active: active === i.href };
  };
  const first = pages.filter((i) => kindOf(i.href) === "rules");
  const rest = pages.filter((i) => kindOf(i.href) !== "rules");

  const items: ShellItem[] = [
    ...first.map(pageItem),
    { label: "Все документы", href: "/documents", count: docs.length, active: active === "/documents" },
    ...DOCUMENT_CATEGORIES.filter((c) => docs.some((d) => d.category === c.value)).map((c) => {
      const href = `/documents?category=${c.value}`;
      return { label: c.label, href, count: docs.filter((d) => d.category === c.value).length, active: active === href };
    }),
    ...rest.map(pageItem),
  ].filter((i): i is ShellItem => Boolean(i));

  return (
    <SectionShell
      title={root?.label ?? "Документы"}
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
  );
}
