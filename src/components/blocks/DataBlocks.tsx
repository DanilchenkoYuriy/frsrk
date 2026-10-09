import Link from "next/link";
import type { ReactNode } from "react";
import {
  getAudioTracks,
  getDocuments,
  getEvents,
  getGalleries,
  getMunicipalities,
  getNews,
  getSections,
  getSettings,
  populated,
  type Event,
  type Gallery,
  type Media,
  type Municipality,
  type Page,
  type Video,
} from "@/lib/cms";
import { EVENT_STATUS_LABELS, eventStatus, todayIso } from "@/lib/status";
import { EVENT_LEVELS, EVENT_TYPES, labelOf } from "@/lib/constants";
import { dayAndMonth, formatDate, formatRange } from "@/lib/dates";
import { telHref } from "@/lib/site";
import { formatInt, jumpStatsOf, jumpsWord, plural } from "@/lib/stats";
import { isExternal, linkHref, visibleLinks } from "@/lib/links";
import type { SiteTree } from "@/lib/tree";
import { Picture } from "@/components/ui/Picture";
import { ICONS } from "@/components/ui/Icons";
import { CrimeaMap } from "@/components/sections/CrimeaMap";
import { HeroVideo } from "@/components/home/HeroVideo";

/** Блоки страницы из админки (тип каждого блока берётся из сгенерированных типов Payload). */
export type PageBlock = NonNullable<Page["layout"]>[number];
export type BlockOf<T extends PageBlock["blockType"]> = Extract<PageBlock, { blockType: T }>;

/** Заголовок блока: красная черта с подписью, заголовок и ссылка справа. */
export function BlockHead({ kicker, title, id, more }: { kicker?: string | null; title?: string | null; id: string; more?: { label: string; href: string } | null }) {
  if (!kicker && !title && !more) return null;
  return (
    <div className="block__head">
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        {title ? (
          <h2 className="block__title" id={id}>
            {title}
          </h2>
        ) : null}
      </div>
      {more ? (
        <Link href={more.href} className="more">
          {more.label}
        </Link>
      ) : null}
    </div>
  );
}

export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return isExternal(href) ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/* Первый экран */

export function HeroView({ block, tree }: { block: BlockOf<"hero">; tree: SiteTree }) {
  const image = populated<Media>(block.image);
  const video = block.mode === "video" ? populated<Video>(block.video) : null;
  const buttons = visibleLinks(block.buttons, tree);
  return (
    <section className="hero" aria-labelledby="hero-title">
      {image ? (
        <div className="hero__media">
          <Picture media={image} alt="" sizes="(max-width: 760px) 1500px, 100vw" priority />
        </div>
      ) : null}
      {video?.url ? <HeroVideo src={video.url} allowMobile={Boolean(block.videoMobile)} /> : null}
      <div className="container hero__inner">
        <h1 className="hero__title" id="hero-title">
          {block.title}
        </h1>
        {block.lead ? <p className="hero__lead">{block.lead}</p> : null}
        {buttons.length ? (
          <div className="hero__actions">
            {buttons.map((b) => (
              <SmartLink key={b.href + b.label} href={b.href} className={`btn btn--${b.style === "light" ? "light" : "red"}`}>
                {b.label}
              </SmartLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* Мероприятия */

function EventRowHome({ e, today }: { e: Event; today: string }) {
  const status = eventStatus(e, today);
  const { day, month } = dayAndMonth(e.dateFrom);
  const city = populated<Municipality>(e.municipality)?.name;
  const badge = status === "registration" ? "badge badge--green" : status === "finished" ? "badge badge--gray" : "badge badge--red";
  return (
    <Link href={`/calendar/${e.slug}`} className="ev">
      <div className="ev__date" aria-hidden="true">
        <span className="ev__day">{day}</span>
        <span className="ev__month">{month.slice(0, 3)}</span>
      </div>
      <div>
        <p className="ev__title">{e.title}</p>
        <div className="ev__meta">
          <span>{formatRange(e.dateFrom, e.dateTo)}</span>
          {city || e.venue ? <span>{[city, e.venue].filter(Boolean).join(", ")}</span> : null}
        </div>
        <div className="ev__badges">
          <span className="badge">{labelOf(EVENT_LEVELS, e.level)}</span>
          <span className={badge}>{EVENT_STATUS_LABELS[status]}</span>
        </div>
      </div>
      <span className="ev__arrow" aria-hidden="true">→</span>
    </Link>
  );
}

function EventDone({ e, today }: { e: Event; today: string }) {
  const { rows, total } = jumpStatsOf(e.jumpStats);
  if (!rows.length)
    return (
      <div className="ev-list">
        <EventRowHome e={e} today={today} />
      </div>
    );
  return (
    <Link href={`/calendar/${e.slug}`} className="done">
      <span className="done__date">{formatRange(e.dateFrom, e.dateTo)}</span>
      <h3 className="done__title">{e.title}</h3>
      <p className="done__total">
        <span className="done__num">{formatInt(total)}</span> {jumpsWord(total)} за соревнование
      </p>
      <ul className="done__rows">
        {rows.map((r) => (
          <li key={r.label}>
            <span>{r.label}</span>
            <b>{formatInt(r.jumps)}</b>
          </li>
        ))}
      </ul>
      <span className="done__go">Результаты и протоколы</span>
    </Link>
  );
}

/** Какие мероприятия показывать: сами (ближайшие и последнее прошедшее) или выбранные в админке. */
export async function pickEvents(block: BlockOf<"events">) {
  const today = todayIso();
  const events = await getEvents();
  const upcoming = events.filter((e) => eventStatus(e, today) !== "finished").sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const recent = events.filter((e) => eventStatus(e, today) === "finished").sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));
  const pick = (ref: number | Event | null | undefined) => {
    const id = ref && typeof ref === "object" ? ref.id : ref;
    return events.find((e) => e.id === id);
  };
  if (block.mode === "manual") {
    const featured = pick(block.featured);
    return {
      today,
      featured,
      side: (block.side ?? []).map(pick).filter((e): e is Event => Boolean(e) && e !== featured),
      done: pick(block.recent),
      upcomingCount: upcoming.length,
    };
  }
  return { today, featured: upcoming[0], side: upcoming.slice(1, 2), done: recent[0], upcomingCount: upcoming.length };
}

export async function EventsView({ block }: { block: BlockOf<"events"> }) {
  const { today, featured, side, done, upcomingCount } = await pickEvents(block);
  if (!featured && !side.length && !done) return null;
  const image = populated<Media>(block.image);
  const title = block.title?.trim() || (block.mode === "manual" || upcomingCount ? "Ближайшие мероприятия" : "Недавние мероприятия");
  return (
    <>
      <BlockHead kicker={block.kicker} title={title} id={`events-${block.id}`} more={{ label: "Весь календарь", href: "/calendar" }} />
      <div className={featured ? "events-home" : undefined}>
        {featured ? (
          <Link href={`/calendar/${featured.slug}`} className={`feature${image ? " feature--photo" : ""}`}>
            {image ? (
              <span className="feature__media" aria-hidden="true">
                <Picture media={image} alt="" sizes="(max-width: 900px) 100vw, 60vw" />
              </span>
            ) : null}
            <span className="feature__date">{formatRange(featured.dateFrom, featured.dateTo)}</span>
            <h3 className="feature__title">{featured.title}</h3>
            <p className="feature__meta">
              {[labelOf(EVENT_TYPES, featured.type), labelOf(EVENT_LEVELS, featured.level).toLowerCase(), [populated<Municipality>(featured.municipality)?.name, featured.venue].filter(Boolean).join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <span className="feature__go">Подробнее</span>
          </Link>
        ) : null}
        {side.length || done ? (
          <div className="events-home__side">
            {side.length ? (
              <div className="ev-list">
                {side.map((e) => (
                  <EventRowHome key={e.id} e={e} today={today} />
                ))}
              </div>
            ) : null}
            {done ? (
              <div>
                <p className="month-title" style={{ marginTop: 0 }}>
                  Недавно прошло
                </p>
                <EventDone e={done} today={today} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

/* Карта секций */

async function mapData() {
  const [municipalities, sections] = await Promise.all([getMunicipalities(), getSections()]);
  const counts = new Map<string, number>();
  for (const s of sections) {
    const slug = populated<Municipality>(s.municipality)?.slug;
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const items = municipalities.map((m) => ({ slug: m.slug as string, name: m.name, count: counts.get(m.slug as string) ?? 0 }));
  // Севастополь не входит в Республику Крым, поэтому в счёт «муниципальных образований Крыма» не идёт
  const republicWithSections = items.filter((m) => m.slug !== "sevastopol" && m.count > 0).length;
  return { items, sectionsCount: sections.length, republicWithSections };
}

export async function SectionsMapView({ block }: { block: BlockOf<"sectionsMap"> }) {
  const { items, sectionsCount, republicWithSections } = await mapData();
  const withSections = items.filter((m) => m.count > 0);
  return (
    <div className="finder">
      <div className="finder__side" style={{ alignSelf: "center" }}>
        <div>
          {block.kicker ? <p className="kicker">{block.kicker}</p> : null}
          {block.title ? (
            <h2 className="block__title" id={`map-${block.id}`}>
              {block.title}
            </h2>
          ) : null}
          <p className="block__lead">
            {sectionsCount
              ? `Секции федерации работают в ${republicWithSections} ${plural(republicWithSections, ["муниципальном образовании", "муниципальных образованиях", "муниципальных образованиях"])} Республики Крым. Нажмите на территорию на карте.`
              : "Карта Республики Крым по 25 муниципальным образованиям и Севастополь. Секции появятся на ней сразу после добавления."}
          </p>
        </div>
        {withSections.length ? (
          <div className="chips">
            {withSections.map((m) => (
              <Link key={m.slug} href={`/sections?city=${m.slug}`} className="chip">
                {m.name}
                <span className="chip__count">{m.count}</span>
              </Link>
            ))}
          </div>
        ) : null}
        <div>
          <Link href="/sections" className="btn btn--red">
            Открыть поиск секций
          </Link>
        </div>
      </div>
      <CrimeaMap municipalities={items} hrefBase="/sections?city=" />
    </div>
  );
}

/* Фото из альбома */

export async function GalleryView({ block }: { block: BlockOf<"gallery"> }) {
  const chosen = populated<Gallery>(block.gallery);
  const gallery = chosen ?? (await getGalleries())[0];
  const photos = (gallery?.photos ?? [])
    .map((p) => populated<Media>(p.image))
    .filter((m): m is Media => Boolean(m?.url))
    .slice(0, 5);
  if (!gallery || photos.length < 3) return null;
  return (
    <>
      <BlockHead kicker={block.kicker} title={block.title} id={`photo-${block.id}`} more={{ label: "Все фото и видео", href: "/media" }} />
      <div className="photo-strip">
        {photos.map((m, i) => (
          <Link key={m.id} href={`/media/photos/${gallery.slug}`} aria-label="Открыть фотоальбом">
            <Picture media={m} sizes={i === 0 ? "(min-width: 1100px) 560px, 100vw" : "(min-width: 1100px) 300px, 50vw"} />
          </Link>
        ))}
      </div>
    </>
  );
}

/** Есть ли что показать в блоке с данными: пустые блоки не выводятся вовсе, чтобы не оставлять пустых полос. */
export async function hasData(block: PageBlock): Promise<boolean> {
  switch (block.blockType) {
    case "events": {
      const { featured, side, done } = await pickEvents(block);
      return Boolean(featured || side.length || done);
    }
    case "news":
      return (await getNews(1)).length > 0;
    case "gallery": {
      const gallery = populated<Gallery>(block.gallery) ?? (await getGalleries())[0];
      return (gallery?.photos ?? []).filter((p) => populated<Media>(p.image)?.url).length >= 3;
    }
    default:
      return true;
  }
}

/* Новости */

export async function NewsView({ block }: { block: BlockOf<"news"> }) {
  const news = await getNews(block.count ?? 3);
  if (!news.length) return null;
  return (
    <>
      <BlockHead kicker={block.kicker} title={block.title} id={`news-${block.id}`} more={{ label: "Все новости", href: "/news" }} />
      <div className="news-grid">
        {news.map((n) => (
          <Link key={n.id} href={`/news/${n.slug}`} className="news-card">
            {populated<Media>(n.cover) ? (
              <div className="news-card__media">
                <Picture media={n.cover} sizes="(min-width: 900px) 400px, 100vw" />
              </div>
            ) : null}
            <span className="news-card__date">{formatDate(n.publishedAt)}</span>
            <h3 className="news-card__title">{n.title}</h3>
            <p className="news-card__text">{n.excerpt}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

/* Плитки-ссылки */

export function TilesView({ block, tree }: { block: BlockOf<"tiles">; tree: SiteTree }) {
  const tiles = visibleLinks(block.items, tree);
  if (!tiles.length) return null;
  const moreHref = block.moreLabel ? linkHref(block.moreLink, tree) : null;
  return (
    <>
      <BlockHead kicker={block.kicker} title={block.title} id={`tiles-${block.id}`} more={moreHref ? { label: block.moreLabel as string, href: moreHref } : null} />
      <div className="doc-tiles">
        {tiles.map((t) => (
          <SmartLink key={t.href + t.title} href={t.href} className="tile">
            <span className="tile__icon">{ICONS[t.icon ?? "scroll"]}</span>
            <span className="tile__title">{t.title}</span>
            {t.text ? <span className="tile__text">{t.text}</span> : null}
          </SmartLink>
        ))}
      </div>
    </>
  );
}

/* Федерация в цифрах */

export async function StatsView() {
  const [{ sectionsCount, republicWithSections }, documents, audio, events] = await Promise.all([mapData(), getDocuments(), getAudioTracks(), getEvents()]);
  const today = todayIso();
  const upcoming = events.filter((e) => eventStatus(e, today) !== "finished").length;
  const stats = [
    { icon: "pin", n: sectionsCount, label: plural(sectionsCount, ["секция в Крыму", "секции в Крыму", "секций в Крыму"]), href: "/sections" },
    { icon: "flag", n: republicWithSections, label: plural(republicWithSections, ["муниципальное образование Крыма с секцией", "муниципальных образования Крыма с секциями", "муниципальных образований Крыма с секциями"]), href: "/sections" },
    { icon: "calendar", n: upcoming, label: `${plural(upcoming, ["ближайшее мероприятие", "ближайших мероприятия", "ближайших мероприятий"])} в календаре`, href: "/calendar" },
    { icon: "scroll", n: documents.length, label: `${plural(documents.length, ["документ", "документа", "документов"])} и ${audio.length} ${plural(audio.length, ["дорожка", "дорожки", "дорожек"])}`, href: "/documents" },
  ].filter((s) => s.n > 0);
  if (!stats.length) return null;
  return (
    <section className="stats" aria-label="Федерация в цифрах">
      <div className="container">
        <div className="stats__list">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="stats__item">
              <span className="stats__icon">{ICONS[s.icon]}</span>
              <span className="stats__text">
                <span className="stats__num">{s.n}</span>
                <span className="stats__label">{s.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Полоса «Остались вопросы?» */

export async function ContactBandView({ block, tree }: { block: BlockOf<"contactBand">; tree: SiteTree }) {
  const settings = await getSettings();
  const href = linkHref(block.buttonLink, tree);
  return (
    <div className="contact-band">
      <div>
        {block.title ? (
          <h2 className="block__title" style={{ color: "#fff" }}>
            {block.title}
          </h2>
        ) : null}
        {block.text ? (
          <p className="block__lead" style={{ color: "rgb(255 255 255 / 0.8)" }}>
            {block.text}
          </p>
        ) : null}
        {href && block.buttonLabel ? (
          <div style={{ marginTop: 22 }}>
            <SmartLink href={href} className="btn btn--red">
              {block.buttonLabel}
            </SmartLink>
          </div>
        ) : null}
      </div>
      <dl className="contact-band__list">
        {settings.phone ? (
          <div>
            <dt>Телефон</dt>
            <dd>
              <a href={telHref(settings.phone)}>{settings.phone}</a>
            </dd>
          </div>
        ) : null}
        {settings.email ? (
          <div>
            <dt>Почта</dt>
            <dd>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </dd>
          </div>
        ) : null}
        {settings.address ? (
          <div>
            <dt>Адрес</dt>
            <dd style={{ fontSize: "1rem" }}>{settings.address}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
