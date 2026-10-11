import type { ReactNode } from "react";
import { getDocuments, getMunicipalities, getPeople, populated, type DocumentDoc, type Media, type Person, type Video } from "@/lib/cms";
import { visibleLinks } from "@/lib/links";
import type { SiteTree } from "@/lib/tree";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { PersonCard } from "@/components/people/PersonCard";
import { Picture } from "@/components/ui/Picture";
import { RichText, splitByHeading } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";
import {
  ContactBandView,
  EventsView,
  GalleryView,
  hasData,
  HeroView,
  NewsView,
  SectionsMapView,
  SmartLink,
  StatsView,
  TilesView,
  type BlockOf,
  type PageBlock,
} from "@/components/blocks/DataBlocks";

type TabContent = NonNullable<NonNullable<BlockOf<"tabs">["tabs"]>[number]["content"]>[number];
type AnyBlock = PageBlock | TabContent;

const isHidden = (b: { hidden?: boolean | null }) => Boolean(b.hidden);

/* Простые блоки */

function TextView({ block }: { block: BlockOf<"text"> }) {
  if (block.splitTabs) {
    const { intro, sections } = splitByHeading(block.content);
    if (sections.length >= 3) {
      return (
        <>
          {intro ? <RichText data={intro} /> : null}
          <Tabs label="Разделы" tabs={sections.map((s, i) => ({ id: `${block.id}-${i}`, label: s.title, content: <RichText data={s.data} /> }))} />
        </>
      );
    }
  }
  return <RichText data={block.content} />;
}

function TextImageView({ block }: { block: BlockOf<"textImage"> }) {
  return (
    <div className={`text-image${block.imageSide === "left" ? " text-image--left" : ""}`}>
      <div>
        {block.kicker ? <p className="kicker">{block.kicker}</p> : null}
        {block.title ? <h2 className="h3">{block.title}</h2> : null}
        <RichText data={block.content} />
      </div>
      <div className="text-image__media">
        <Picture media={block.image} alt="" sizes="(max-width: 900px) 100vw, 50vw" />
      </div>
    </div>
  );
}

function ImageView({ block }: { block: BlockOf<"image"> }) {
  return (
    <figure className="page-block--image">
      <Picture media={block.image} alt={block.caption ?? ""} sizes="(max-width: 760px) 100vw, 900px" />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}

function ButtonsView({ block, tree }: { block: BlockOf<"buttons">; tree: SiteTree }) {
  const buttons = visibleLinks(block.buttons, tree);
  if (!buttons.length) return null;
  return (
    <div className="page-block--buttons">
      {buttons.map((b) => (
        <SmartLink key={b.href + b.label} href={b.href} className={`btn btn--${b.style === "red" ? "red" : "line"}`}>
          {b.label}
        </SmartLink>
      ))}
    </div>
  );
}

async function DocumentsView({ block }: { block: BlockOf<"documents"> }) {
  const all = await getDocuments();
  const docs =
    block.mode === "manual"
      ? (block.documents ?? []).flatMap((d) => {
          const id = typeof d === "object" ? d.id : d;
          return all.filter((x) => x.id === id);
        })
      : all.filter((d) => d.category === block.category && d.inList !== false);
  const shown = docs.filter((d: DocumentDoc) => d.url);
  if (!shown.length) return null;
  return (
    <section>
      {block.title ? <h2 className="h3">{block.title}</h2> : null}
      <ul>
        {shown.map((d) => (
          <DocumentRow key={d.id} doc={d} />
        ))}
      </ul>
    </section>
  );
}

function LinksView({ block }: { block: BlockOf<"links"> }) {
  const items = (block.items ?? []).filter((i) => i.url?.trim());
  if (!items.length) return null;
  return (
    <section>
      {block.title ? <h2 className="h3">{block.title}</h2> : null}
      <ul>
        {items.map((s) => (
          <li className="doc" key={s.id ?? s.url}>
            <span className="doc__icon" aria-hidden="true">
              WEB
            </span>
            <div>
              <p className="doc__title">{s.title}</p>
              {s.text ? <p className="doc__desc">{s.text}</p> : null}
            </div>
            <div className="doc__side">
              <a className="btn btn--line btn--sm" href={s.url} target="_blank" rel="noopener noreferrer">
                Перейти
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FaqView({ block }: { block: BlockOf<"faq"> }) {
  const items = block.items ?? [];
  if (!items.length) return null;
  return (
    <section>
      {block.title ? <h2 className="h3">{block.title}</h2> : null}
      <div className="faq">
        {items.map((q) => (
          <details key={q.id ?? q.title} className="faq__item">
            <summary className="faq__q">{q.title}</summary>
            <p className="faq__a">{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

async function PeopleView({ block }: { block: BlockOf<"people"> }) {
  let people: Person[];
  if (block.group === "representative") {
    // Представители указаны у муниципальных образований: показываем их с названием территории
    const municipalities = await getMunicipalities();
    people = municipalities.flatMap((m) => {
      const person = populated<Person>(m.representative);
      return person ? [{ ...person, position: `${m.name}. ${person.position}` }] : [];
    });
  } else {
    people = (await getPeople()).filter((p) => p.group === block.group);
  }
  if (!people.length) return null;
  return (
    <section>
      {block.title ? <h2 className="h3">{block.title}</h2> : null}
      <ul className="people">
        {people.map((p) => (
          <PersonCard key={p.id} p={p} />
        ))}
      </ul>
    </section>
  );
}

function VideoView({ block }: { block: BlockOf<"video"> }) {
  const videos = (block.videos ?? []).map((v) => populated<Video>(v)).filter((v): v is Video => Boolean(v && v.published !== false && (v.url || v.externalUrl)));
  if (!videos.length) return null;
  return (
    <section>
      {block.title ? <h2 className="h3">{block.title}</h2> : null}
      <ul className="video-list">
        {videos.map((v) => (
          <li className="video-item" key={v.id}>
            {v.url ? (
              <video controls preload="none" poster={populated<Media>(v.poster)?.url ?? undefined} src={v.url} />
            ) : (
              <a href={v.externalUrl as string} target="_blank" rel="noopener noreferrer">
                {populated<Media>(v.poster) ? <Picture media={v.poster} className="video-item__poster" sizes="360px" /> : <div className="video-item__poster" />}
              </a>
            )}
            <p className="video-item__title">{v.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TabsView({ block, tree }: { block: BlockOf<"tabs">; tree: SiteTree }) {
  const tabs = (block.tabs ?? []).filter((t) => !t.hidden && (t.content ?? []).some((b) => !isHidden(b)));
  if (!tabs.length) return null;
  const body = (t: (typeof tabs)[number]) => <BlockList blocks={t.content ?? []} tree={tree} />;
  if (tabs.length === 1) return body(tabs[0]);
  return <Tabs label="Вкладки" tabs={tabs.map((t, i) => ({ id: t.id ?? `${block.id}-${i}`, label: t.label, content: body(t) }))} />;
}

/** Один блок без обёртки. builtin — основное содержимое встроенной страницы. */
function BlockView({ block, tree, builtin }: { block: AnyBlock; tree: SiteTree; builtin?: ReactNode }) {
  switch (block.blockType) {
    case "text":
      return <TextView block={block} />;
    case "textImage":
      return <TextImageView block={block} />;
    case "image":
      return <ImageView block={block} />;
    case "buttons":
      return <ButtonsView block={block} tree={tree} />;
    case "documents":
      return <DocumentsView block={block} />;
    case "links":
      return <LinksView block={block} />;
    case "faq":
      return <FaqView block={block} />;
    case "people":
      return <PeopleView block={block} />;
    case "video":
      return <VideoView block={block} />;
    case "tabs":
      return <TabsView block={block} tree={tree} />;
    case "events":
      return <EventsView block={block} />;
    case "sectionsMap":
      return <SectionsMapView block={block} />;
    case "news":
      return <NewsView block={block} />;
    case "gallery":
      return <GalleryView block={block} />;
    case "tiles":
      return <TilesView block={block} tree={tree} />;
    case "contactBand":
      return <ContactBandView block={block} tree={tree} />;
    case "builtin":
      return <>{builtin}</>;
    default:
      return null;
  }
}

/** Блоки внутри колонки: обычные страницы и вкладки. Пустые блоки с данными не выводятся. */
export async function BlockList({ blocks, tree, builtin }: { blocks: readonly AnyBlock[]; tree: SiteTree; builtin?: ReactNode }) {
  const shown = blocks.filter((b) => !isHidden(b) && b.blockType !== "hero");
  const filled = await Promise.all(shown.map((b) => hasData(b as PageBlock)));
  return (
    <>
      {shown.map((b, i) => {
        const key = b.id ?? i;
        if (!filled[i]) return null;
        if (b.blockType === "builtin") return <BlockView key={key} block={b} tree={tree} builtin={builtin} />;
        if (b.blockType === "stats") return <StatsView key={key} />;
        return (
          <div key={key} className="page-block">
            <BlockView block={b} tree={tree} />
          </div>
        );
      })}
    </>
  );
}

/**
 * Блоки во всю ширину, как на главной: каждый в своей полосе, фон полос чередуется.
 * Первый экран и «Федерация в цифрах» оформлены сами.
 */
export async function WideBlocks({ blocks, tree, builtin }: { blocks: readonly PageBlock[]; tree: SiteTree; builtin?: ReactNode }) {
  const shown = blocks.filter((b) => !isHidden(b));
  const filled = await Promise.all(shown.map(hasData));
  const visible = shown.filter((_, i) => filled[i]);
  // Номер полосы с фоном у каждого блока: первый экран, цифры и «Остались вопросы?» полосу не занимают
  const bandOf = visible.map((_, i) => visible.slice(0, i).filter((b) => !["hero", "stats", "contactBand"].includes(b.blockType)).length);
  return (
    <>
      {visible.map((b, i) => {
        const key = b.id ?? i;
        const bands = bandOf[i];
        if (b.blockType === "hero") return <HeroView key={key} block={b} tree={tree} />;
        if (b.blockType === "stats") return <StatsView key={key} />;
        // «Остались вопросы?» — тёмная карточка: свой фон не нужен, а после белой полосы не нужен и верхний отступ
        if (b.blockType === "contactBand") {
          const afterWhite = bands > 0 && (bands - 1) % 2 === 0;
          return (
            <section key={key} className="block" style={afterWhite ? { paddingTop: 0 } : undefined}>
              <div className="container">
                <BlockView block={b} tree={tree} />
              </div>
            </section>
          );
        }
        const soft = bands % 2 === 1;
        return (
          <section key={key} className={`block${soft ? " block--soft" : ""}`}>
            <div className="container">
              <BlockView block={b} tree={tree} builtin={builtin} />
            </div>
          </section>
        );
      })}
    </>
  );
}
