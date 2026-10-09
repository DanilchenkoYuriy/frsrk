import type { Page } from "@/payload-types";
import { pageKindOf } from "@/lib/constants";

/** Страница в дереве сайта: всё, что нужно для меню, адресов и хлебных крошек. */
export interface TreeNode {
  id: number;
  kind: string;
  title: string;
  /** Название в меню */
  label: string;
  href: string | null;
  parentId: number | null;
  published: boolean;
  showInMenu: boolean;
  dropdown: boolean;
  alsoInTopMenu: boolean;
  /** Есть ли на странице видимые блоки. Пустой раздел открывает свой первый пункт. */
  hasBlocks: boolean;
  children: TreeNode[];
}

export interface MenuLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const idOf = (v: unknown): number | null => (v && typeof v === "object" ? ((v as { id: number }).id ?? null) : typeof v === "number" ? v : null);

/** Видима ли страница посетителям: опубликована сама и все её родители. */
const visible = (n: TreeNode) => n.published && Boolean(n.href);
const inMenu = (n: TreeNode) => visible(n) && n.showInMenu;

export function buildTree(pages: readonly Page[]) {
  const nodes = new Map<number, TreeNode>();
  for (const p of pages) {
    nodes.set(p.id, {
      id: p.id,
      kind: p.kind ?? "custom",
      title: p.title,
      label: p.menuLabel?.trim() || p.title,
      href: null,
      parentId: idOf(p.parent),
      published: p.published !== false,
      showInMenu: p.showInMenu !== false,
      dropdown: Boolean(p.dropdown),
      alsoInTopMenu: Boolean(p.alsoInTopMenu),
      hasBlocks: (p.layout ?? []).some((b) => !(b as { hidden?: boolean | null }).hidden),
      children: [],
    });
  }
  const slugs = new Map(pages.map((p) => [p.id, p.slug ?? null]));

  // Родитель, которого нет или который ведёт в цикл, не считается
  const parentOf = (n: TreeNode) => (n.parentId !== null && n.parentId !== n.id ? (nodes.get(n.parentId) ?? null) : null);
  const ancestors = (n: TreeNode) => {
    const chain: TreeNode[] = [];
    for (let cur = parentOf(n); cur && !chain.includes(cur) && cur !== n; cur = parentOf(cur)) chain.unshift(cur);
    return chain;
  };

  const roots: TreeNode[] = [];
  for (const n of nodes.values()) {
    const chain = ancestors(n);
    const parent = chain.at(-1);
    if (parent) parent.children.push(n);
    else roots.push(n);
    // Скрытый раздел скрывает и свои страницы
    if (chain.some((a) => !a.published)) n.published = false;
  }

  // Адрес: у встроенных постоянный, у новых — адрес раздела + свой адрес
  const hrefOfNode = (n: TreeNode, seen = new Set<number>()): string | null => {
    if (n.href) return n.href;
    const kind = pageKindOf(n.kind);
    if (kind) return kind.href;
    const slug = slugs.get(n.id);
    if (!slug || seen.has(n.id)) return null;
    seen.add(n.id);
    const parent = parentOf(n);
    const base = parent ? hrefOfNode(parent, seen) : "";
    if (base === null) return null;
    return `${base === "/" ? "" : base}/${slug}`;
  };
  for (const n of nodes.values()) n.href = hrefOfNode(n);

  const byHref = new Map<string, TreeNode>();
  for (const n of nodes.values()) if (n.href && !byHref.has(n.href)) byHref.set(n.href, n);

  /** Корень раздела, в котором лежит страница. */
  const rootOf = (n: TreeNode) => ancestors(n)[0] ?? n;

  /** Первая открываемая страница раздела: сам раздел, если в нём есть блоки, иначе первый видимый пункт. */
  const landing = (n: TreeNode): TreeNode | null => {
    if (n.hasBlocks) return n;
    for (const c of n.children) {
      if (!inMenu(c)) continue;
      const found = landing(c);
      if (found) return found;
    }
    return null;
  };

  const linkOf = (n: TreeNode) => ({ label: n.label, href: (landing(n) ?? n).href as string });

  return {
    nodes,
    roots,
    byId: (id: number | null | undefined) => (id ? (nodes.get(id) ?? null) : null),
    byKind: (kind: string) => [...nodes.values()].find((n) => n.kind === kind) ?? null,
    byHref: (href: string) => byHref.get(href) ?? null,
    /** Адрес опубликованной страницы или null */
    hrefOf: (id: number | null | undefined) => {
      const n = id ? nodes.get(id) : null;
      return n && visible(n) ? n.href : null;
    },
    ancestors,
    rootOf,
    landing,
    /** Верхнее меню: страницы верхнего уровня по порядку, затем отмеченные «ещё и в верхнем меню». */
    topMenu: (): MenuLink[] => {
      const top = roots.filter(inMenu).map((n) => {
        const children = n.dropdown ? n.children.filter(inMenu).map(linkOf) : [];
        return { ...linkOf(n), ...(children.length ? { children } : {}) };
      });
      const pinned = [...nodes.values()].filter((n) => n.parentId !== null && n.alsoInTopMenu && inMenu(n)).map(linkOf);
      return [...top, ...pinned];
    },
    /** Пункты меню слева для раздела: сам раздел (если в нём есть блоки) и его видимые страницы. */
    sideMenu: (root: TreeNode) => [...(root.hasBlocks && visible(root) ? [root] : []), ...root.children.filter(inMenu)].map(linkOf),
  };
}

export type SiteTree = ReturnType<typeof buildTree>;
