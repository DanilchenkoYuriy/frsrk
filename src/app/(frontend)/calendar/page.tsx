import type { Metadata } from "next";
import { getEvents, populated, type DocumentDoc, type Municipality } from "@/lib/cms";
import { EVENT_LEVELS, EVENT_TYPES, labelOf } from "@/lib/constants";
import { EVENT_STATUS_LABELS, eventStatus, todayIso } from "@/lib/status";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { CalendarExplorer, type EventView } from "@/components/calendar/CalendarExplorer";

export const metadata: Metadata = {
  title: "Календарь мероприятий",
  description: "Календарь соревнований, семинаров и сборов ФРСРК. Положения, регламенты, регистрация и протоколы.",
};

export default async function CalendarPage() {
  const today = todayIso();
  const events = await getEvents();

  const views: EventView[] = events.map((e) => {
    const status = eventStatus(e, today);
    const city = populated<Municipality>(e.municipality)?.name;
    const protocols = (e.documents ?? []).filter((d) => (d.kind === "start-protocol" || d.kind === "final-protocol") && populated<DocumentDoc>(d.document)?.url).length;
    return {
      id: e.id,
      slug: e.slug as string,
      title: e.title,
      dateFrom: e.dateFrom.slice(0, 10),
      dateTo: (e.dateTo ?? e.dateFrom).slice(0, 10),
      type: e.type,
      typeLabel: labelOf(EVENT_TYPES, e.type),
      levelLabel: labelOf(EVENT_LEVELS, e.level),
      place: [city, e.venue].filter(Boolean).join(", "),
      status,
      statusLabel: EVENT_STATUS_LABELS[status],
      protocols,
    };
  });

  return (
    <>
      <PageHead banner="calendar" slogan={SLOGANS.calendar} title="Календарь мероприятий" lead="Соревнования, семинары и сборы федерации. Откройте мероприятие, чтобы найти положение, регистрацию и протоколы." crumbs={[{ label: "Календарь" }]} />
      <div className="page">
        <div className="container">
          {views.length ? <CalendarExplorer events={views} today={today} /> : <p className="empty">Мероприятий пока нет.</p>}
        </div>
      </div>
    </>
  );
}
