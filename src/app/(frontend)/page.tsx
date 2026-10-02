import Link from "next/link";
import { getAudioTracks, getDocuments, getEvents, getGalleries, getMunicipalities, getNews, getSections, getSettings, populated, type Event, type Media, type Municipality, type Video } from "@/lib/cms";
import { EVENT_STATUS_LABELS, eventStatus, todayIso } from "@/lib/status";
import { EVENT_LEVELS, EVENT_TYPES, labelOf } from "@/lib/constants";
import { dayAndMonth, formatDate, formatRange } from "@/lib/dates";
import { telHref } from "@/lib/site";
import { formatInt, jumpStatsOf, jumpsWord, plural } from "@/lib/stats";
import { Picture } from "@/components/ui/Picture";
import { ICONS } from "@/components/ui/Icons";
import { CrimeaMap } from "@/components/sections/CrimeaMap";
import { HeroVideo } from "@/components/home/HeroVideo";

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
  if (!rows.length) return <div className="ev-list"><EventRowHome e={e} today={today} /></div>;
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

export default async function HomePage() {
  const today = todayIso();
  const [settings, events, municipalities, sections, news, documents, audio, galleries] = await Promise.all([
    getSettings(),
    getEvents(),
    getMunicipalities(),
    getSections(),
    getNews(3),
    getDocuments(),
    getAudioTracks(),
    getGalleries(),
  ]);

  const upcoming = events.filter((e) => eventStatus(e, today) !== "finished").sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const recent = events.filter((e) => eventStatus(e, today) === "finished").sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));
  const featured = upcoming[0];
  const nextUpcoming = upcoming[1];
  const lastDone = recent[0];

  const counts = new Map<string, number>();
  for (const s of sections) {
    const slug = populated<Municipality>(s.municipality)?.slug;
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const mapItems = municipalities.map((m) => ({ slug: m.slug as string, name: m.name, count: counts.get(m.slug as string) ?? 0 }));
  const withSections = mapItems.filter((m) => m.count > 0);
  // Севастополь не входит в Республику Крым, поэтому в счёт «муниципальных образований Крыма» не идёт
  const republic = mapItems.filter((m) => m.slug !== "sevastopol");
  const republicWithSections = republic.filter((m) => m.count > 0).length;

  const photos = (galleries[0]?.photos ?? []).map((p) => populated<Media>(p.image)).filter((m): m is Media => Boolean(m?.url)).slice(0, 5);
  const hero = populated<Media>(settings.heroImage);
  const heroVideo = settings.heroMode === "video" ? populated<Video>(settings.heroVideo) : null;

  const countIn = (cat: string) => documents.filter((d) => d.category === cat).length;
  const tiles = [
    { href: "/documents?category=federation", icon: "scroll", title: "Устав и аккредитация", text: `${countIn("federation")} ${plural(countIn("federation"), ["документ", "документа", "документов"])}` },
    { href: "/documents/rules", icon: "book", title: "Правила вида спорта", text: "Полный текст, дисциплины, судейство" },
    { href: "/documents?category=classification", icon: "medal", title: "ЕВСК и разряды", text: "Нормы и порядок присвоения" },
    { href: "/documents/audio", icon: "music", title: "Музыка для соревнований", text: `${audio.length} ${plural(audio.length, ["дорожка", "дорожки", "дорожек"])}, слушать и скачать` },
  ].filter((t) => !t.href.includes("federation") || countIn("federation") > 0);

  const stats = [
    { icon: "pin", n: sections.length, label: plural(sections.length, ["секция в Крыму", "секции в Крыму", "секций в Крыму"]), href: "/sections" },
    { icon: "flag", n: republicWithSections, label: plural(republicWithSections, ["муниципальное образование Крыма с секцией", "муниципальных образования Крыма с секциями", "муниципальных образований Крыма с секциями"]), href: "/sections" },
    { icon: "calendar", n: upcoming.length, label: `${plural(upcoming.length, ["ближайшее мероприятие", "ближайших мероприятия", "ближайших мероприятий"])} в календаре`, href: "/calendar" },
    { icon: "scroll", n: documents.length, label: `${plural(documents.length, ["документ", "документа", "документов"])} и ${audio.length} ${plural(audio.length, ["дорожка", "дорожки", "дорожек"])}`, href: "/documents" },
  ].filter((s) => s.n > 0);
  // Полоса скрыта, пока показывать особо нечем: секций и мероприятий мало. Вернуть, когда будет чем похвастаться — поставьте true.
  const showStats = false;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        {hero ? (
          <div className="hero__media">
            <Picture media={hero} alt="" sizes="(max-width: 760px) 1500px, 100vw" priority />
          </div>
        ) : null}
        {heroVideo?.url ? <HeroVideo src={heroVideo.url} allowMobile={Boolean(settings.heroVideoMobile)} /> : null}
        <div className="container hero__inner">
          <h1 className="hero__title" id="hero-title">
            {settings.heroTitle || "От первого прыжка до сборной Крыма"}
          </h1>
          <p className="hero__lead">{settings.heroLead || "Роуп скиппинг (спортивная скакалка): секции по городам республики, календарь соревнований, положения и протоколы."}</p>
          <div className="hero__actions">
            <Link href="/sections" className="btn btn--red">
              Найти секцию
            </Link>
            <Link href="/calendar" className="btn btn--light">
              Календарь соревнований
            </Link>
          </div>
        </div>
      </section>

      {showStats ? (
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
      ) : null}

      {upcoming.length > 0 || recent.length > 0 ? (
        <section className="block" aria-labelledby="events-title">
          <div className="container">
            <div className="block__head">
              <div>
                <p className="kicker">Календарь</p>
                <h2 className="block__title" id="events-title">
                  {upcoming.length ? "Ближайшие мероприятия" : "Недавние мероприятия"}
                </h2>
              </div>
              <Link href="/calendar" className="more">
                Весь календарь
              </Link>
            </div>
            <div className={featured ? "events-home" : undefined}>
              {featured ? (
                <Link href={`/calendar/${featured.slug}`} className="feature">
                  <span className="feature__date">{formatRange(featured.dateFrom, featured.dateTo)}</span>
                  <h3 className="feature__title">{featured.title}</h3>
                  <p className="feature__meta">
                    {[labelOf(EVENT_TYPES, featured.type), labelOf(EVENT_LEVELS, featured.level).toLowerCase(), [populated<Municipality>(featured.municipality)?.name, featured.venue].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                  </p>
                  <span className="feature__go">Подробнее</span>
                </Link>
              ) : null}
              {nextUpcoming || lastDone ? (
                <div className="events-home__side">
                  {nextUpcoming ? (
                    <div className="ev-list">
                      <EventRowHome e={nextUpcoming} today={today} />
                    </div>
                  ) : null}
                  {lastDone ? (
                    <div>
                      <p className="month-title" style={{ marginTop: 0 }}>
                        Недавно прошло
                      </p>
                      <EventDone e={lastDone} today={today} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="block block--soft" aria-labelledby="map-title">
        <div className="container">
          <div className="finder">
            <div className="finder__side" style={{ alignSelf: "center" }}>
              <div>
                <p className="kicker">Где заниматься</p>
                <h2 className="block__title" id="map-title">
                  Найдите секцию рядом с домом
                </h2>
                <p className="block__lead">
                  {sections.length
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
            <CrimeaMap municipalities={mapItems} hrefBase="/sections?city=" />
          </div>
        </div>
      </section>

      {photos.length >= 3 ? (
        <section className="block" aria-labelledby="photo-title">
          <div className="container">
            <div className="block__head">
              <div>
                <p className="kicker">Медиа</p>
                <h2 className="block__title" id="photo-title">
                  Как это выглядит
                </h2>
              </div>
              <Link href="/media" className="more">
                Все фото и видео
              </Link>
            </div>
            <div className="photo-strip">
              {photos.map((m, i) => (
                <Link key={m.id} href={`/media/photos/${galleries[0].slug}`} aria-label="Открыть фотоальбом">
                  <Picture media={m} sizes={i === 0 ? "(min-width: 1100px) 560px, 100vw" : "(min-width: 1100px) 300px, 50vw"} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="block block--soft" aria-labelledby="news-title">
          <div className="container">
            <div className="block__head">
              <div>
                <p className="kicker">Новости</p>
                <h2 className="block__title" id="news-title">
                  Что нового в федерации
                </h2>
              </div>
              <Link href="/news" className="more">
                Все новости
              </Link>
            </div>
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
          </div>
        </section>
      ) : null}

      {tiles.length > 0 ? (
        <section className="block" aria-labelledby="docs-title">
          <div className="container">
            <div className="block__head">
              <div>
                <p className="kicker">Документы</p>
                <h2 className="block__title" id="docs-title">
                  Всё, что нужно спортсмену, тренеру и судье
                </h2>
              </div>
              <Link href="/documents" className="more">
                Все документы
              </Link>
            </div>
            <div className="doc-tiles">
              {tiles.map((t) => (
                <Link key={t.href} href={t.href} className="tile">
                  <span className="tile__icon">{ICONS[t.icon]}</span>
                  <span className="tile__title">{t.title}</span>
                  <span className="tile__text">{t.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="block" style={{ paddingTop: 0 }} aria-labelledby="contacts-title">
        <div className="container">
          <div className="contact-band">
            <div>
              <h2 className="block__title" id="contacts-title" style={{ color: "#fff" }}>
                Остались вопросы?
              </h2>
              <p className="block__lead" style={{ color: "rgb(255 255 255 / 0.8)" }}>
                О занятиях, соревнованиях, судействе и открытии новых секций. Напишите или позвоните.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link href="/contacts" className="btn btn--red">
                  Написать в федерацию
                </Link>
              </div>
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
        </div>
      </section>
    </>
  );
}
