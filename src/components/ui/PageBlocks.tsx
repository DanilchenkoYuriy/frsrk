import Link from "next/link";
import { getDocuments, type DocumentDoc, type Page } from "@/lib/cms";
import { isExternal, visibleLinks } from "@/lib/links";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { Picture } from "@/components/ui/Picture";
import { RichText } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";

type Tab = NonNullable<Page["tabs"]>[number];
type Block = NonNullable<Tab["blocks"]>[number];

async function BlockView({ block }: { block: Block }) {
  switch (block.blockType) {
    case "text":
      return <RichText data={block.content} />;
    case "documents": {
      const all = await getDocuments();
      const docs =
        block.mode === "manual"
          ? (block.documents ?? []).flatMap((d) => {
              const id = typeof d === "object" ? d.id : d;
              return all.filter((x) => x.id === id);
            })
          : all.filter((d) => d.category === block.category);
      const shown = docs.filter((d: DocumentDoc) => d.url);
      if (!shown.length) return null;
      return (
        <section className="page-block">
          {block.title ? <h2 className="h3">{block.title}</h2> : null}
          <ul>
            {shown.map((d) => (
              <DocumentRow key={d.id} doc={d} />
            ))}
          </ul>
        </section>
      );
    }
    case "buttons": {
      const buttons = visibleLinks(block.buttons);
      if (!buttons.length) return null;
      return (
        <div className="page-block page-block--buttons">
          {buttons.map((b) =>
            isExternal(b.href) ? (
              <a key={b.href + b.label} href={b.href} className={`btn btn--${b.style ?? "line"}`} target="_blank" rel="noopener noreferrer">
                {b.label}
              </a>
            ) : (
              <Link key={b.href + b.label} href={b.href} className={`btn btn--${b.style ?? "line"}`}>
                {b.label}
              </Link>
            ),
          )}
        </div>
      );
    }
    case "image":
      return (
        <figure className="page-block page-block--image">
          <Picture media={block.image} alt={block.caption ?? ""} sizes="(max-width: 760px) 100vw, 900px" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    default:
      return null;
  }
}

function TabBody({ tab }: { tab: Tab }) {
  return (
    <>
      {(tab.blocks ?? []).map((block, i) => (
        <BlockView key={block.id ?? i} block={block} />
      ))}
    </>
  );
}

/** Вкладки страницы, собранные из блоков в админке. Одна вкладка выводится без заголовков. */
export function PageTabs({ tabs, label }: { tabs: Page["tabs"]; label: string }) {
  const visible = (tabs ?? []).filter((t) => !t.hidden && t.blocks?.length);
  if (!visible.length) return null;
  if (visible.length === 1) return <TabBody tab={visible[0]} />;
  return <Tabs label={label} tabs={visible.map((t, i) => ({ id: t.id ?? `t${i}`, label: t.label, content: <TabBody tab={t} /> }))} />;
}

export const hasTabs = (tabs: Page["tabs"]) => (tabs ?? []).some((t) => !t.hidden && t.blocks?.length);
