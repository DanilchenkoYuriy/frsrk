import type { BeforeListTableServerProps } from "payload";
import type { Page } from "@/payload-types";

type Node = Pick<Page, "id" | "title" | "menuLabel" | "kind" | "published" | "showInMenu" | "alsoInTopMenu" | "layout"> & { parent?: number | Page | null; children: Node[] };

const parentId = (p: Pick<Page, "parent">) => (p.parent && typeof p.parent === "object" ? p.parent.id : (p.parent ?? null));

const badge = (text: string, tone: "muted" | "warn") => (
  <span
    style={{
      fontSize: 12,
      padding: "2px 8px",
      borderRadius: 999,
      background: tone === "warn" ? "var(--theme-warning-100)" : "var(--theme-elevation-100)",
      color: tone === "warn" ? "var(--theme-warning-800)" : "var(--theme-elevation-700)",
    }}
  >
    {text}
  </span>
);

function Item({ node, admin }: { node: Node; admin: string }) {
  const blocks = node.layout ?? [];
  const shown = blocks.filter((b) => !(b as { hidden?: boolean }).hidden).length;
  return (
    <li style={{ margin: "2px 0" }}>
      <a
        href={`${admin}/collections/pages/${node.id}`}
        style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "8px 12px", borderRadius: 6, textDecoration: "none", color: "inherit", opacity: node.published === false ? 0.55 : 1 }}
        className="pages-tree__link"
      >
        <strong style={{ fontWeight: 600 }}>{node.menuLabel || node.title}</strong>
        <span style={{ color: "var(--theme-elevation-500)", fontSize: 13 }}>
          {shown} {shown % 10 === 1 && shown % 100 !== 11 ? "блок" : shown % 10 >= 2 && shown % 10 <= 4 && (shown % 100 < 10 || shown % 100 >= 20) ? "блока" : "блоков"}
        </span>
        {node.published === false ? badge("скрыта с сайта", "warn") : node.showInMenu === false ? badge("нет в меню", "muted") : null}
        {node.alsoInTopMenu ? badge("и в верхнем меню", "muted") : null}
      </a>
      {node.children.length ? (
        <ul style={{ listStyle: "none", margin: "0 0 0 22px", padding: "0 0 0 12px", borderLeft: "1px solid var(--theme-elevation-150)" }}>
          {node.children.map((c) => (
            <Item key={c.id} node={c} admin={admin} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Дерево страниц над таблицей: разделы и их пункты так, как они стоят в меню сайта. */
export async function PagesTree({ payload }: BeforeListTableServerProps) {
  const res = await payload.find({ collection: "pages", depth: 0, limit: 500, sort: "_order", pagination: false, overrideAccess: true });
  const nodes = new Map<number, Node>(res.docs.map((p) => [p.id, { ...p, children: [] }]));
  const roots: Node[] = [];
  for (const node of nodes.values()) {
    const parent = parentId(node);
    const target = parent !== null ? nodes.get(parent) : undefined;
    if (target && target !== node) target.children.push(node);
    else roots.push(node);
  }
  const admin = payload.config.routes.admin;
  return (
    <section style={{ marginBottom: 28, padding: "16px 12px", border: "1px solid var(--theme-elevation-150)", borderRadius: 8 }}>
      <style>{`.pages-tree__link:hover{background:var(--theme-elevation-50)}`}</style>
      <p style={{ margin: "0 12px 10px", color: "var(--theme-elevation-600)" }}>
        Карта сайта. Нажмите на страницу, чтобы открыть её блоки. Порядок меняется перетаскиванием строк в таблице ниже.
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {roots.map((n) => (
          <Item key={n.id} node={n} admin={admin} />
        ))}
      </ul>
    </section>
  );
}
