import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent, populated, type DocumentDoc, type Municipality } from "@/lib/cms";
import { EVENT_DOC_KINDS, EVENT_LEVELS, EVENT_TYPES, labelOf } from "@/lib/constants";
import { formatDate, formatRange } from "@/lib/dates";
import { EVENT_STATUS_LABELS, eventStatus, todayIso } from "@/lib/status";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { RichText } from "@/components/ui/RichText";
import { DocumentRow } from "@/components/documents/DocumentRow";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return { title: event.title, description: `${formatRange(event.dateFrom, event.dateTo)}. ${event.venue ?? ""}`.trim() };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const today = todayIso();
  const status = eventStatus(event, today);
  const city = populated<Municipality>(event.municipality)?.name;
  const docs = (event.documents ?? [])
    .map((d) => ({ kind: d.kind, doc: populated<DocumentDoc>(d.document) }))
    .filter((d): d is { kind: typeof d.kind; doc: DocumentDoc } => Boolean(d.doc?.url));

  const protocols = docs.filter((d) => d.kind === "start-protocol" || d.kind === "final-protocol");
  const others = docs.filter((d) => !protocols.includes(d));
  const regOpen = Boolean(event.registrationUrl) && status !== "finished" && (!event.registrationDeadline || today <= event.registrationDeadline.slice(0, 10));

  return (
    <>
      <PageHead slogan={SLOGANS.event} title={event.title} lead={formatRange(event.dateFrom, event.dateTo)} crumbs={[{ label: "Календарь", href: "/calendar" }, { label: event.title }]} />
      <div className="page">
        <div className="container layout-2">
          <div>
            <RichText data={event.description} />

            {others.length > 0 ? (
              <section style={{ marginTop: 40 }} aria-labelledby="ev-docs">
                <h2 className="h3" id="ev-docs">
                  Документы
                </h2>
                <ul>
                  {others.map(({ kind, doc }) => (
                    <DocumentRow key={doc.id} doc={{ ...doc, title: `${labelOf(EVENT_DOC_KINDS, kind)}: ${doc.title}` }} />
                  ))}
                </ul>
              </section>
            ) : null}

            {status === "finished" || protocols.length > 0 ? (
              <section style={{ marginTop: 40 }} aria-labelledby="ev-results">
                <h2 className="h3" id="ev-results">
                  Результаты и протоколы
                </h2>
                {protocols.length > 0 ? (
                  <ul>
                    {protocols.map(({ kind, doc }) => (
                      <DocumentRow key={doc.id} doc={{ ...doc, title: `${labelOf(EVENT_DOC_KINDS, kind)}: ${doc.title}` }} />
                    ))}
                  </ul>
                ) : (
                  <p className="empty" style={{ paddingTop: 0 }}>
                    Протоколы этого мероприятия пока не опубликованы.
                  </p>
                )}
              </section>
            ) : null}
          </div>

          <aside>
            <div className="aside-card">
              <h2 className="aside-card__title">О мероприятии</h2>
              <dl className="dl" style={{ margin: 0 }}>
                <div>
                  <dt>Статус</dt>
                  <dd>{EVENT_STATUS_LABELS[status]}</dd>
                </div>
                <div>
                  <dt>Дата</dt>
                  <dd>{formatRange(event.dateFrom, event.dateTo)}</dd>
                </div>
                {city || event.venue ? (
                  <div>
                    <dt>Место</dt>
                    <dd>
                      {[city, event.venue].filter(Boolean).join(", ")}
                      {city || event.venue ? (
                        <>
                          {" "}
                          <a href={`https://yandex.ru/maps/?text=${encodeURIComponent([city, event.venue].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer">
                            На карте
                          </a>
                        </>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Тип и уровень</dt>
                  <dd>
                    {labelOf(EVENT_TYPES, event.type)}, {labelOf(EVENT_LEVELS, event.level).toLowerCase()}
                  </dd>
                </div>
                {event.registrationDeadline ? (
                  <div>
                    <dt>Регистрация до</dt>
                    <dd>{formatDate(event.registrationDeadline)}</dd>
                  </div>
                ) : null}
              </dl>
              <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
                {regOpen ? (
                  <a className="btn btn--red" href={event.registrationUrl!} target="_blank" rel="noopener noreferrer">
                    Регистрация
                  </a>
                ) : null}
                <a className="btn btn--line" href={`/calendar/${event.slug}/event.ics`}>
                  Добавить в календарь
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
