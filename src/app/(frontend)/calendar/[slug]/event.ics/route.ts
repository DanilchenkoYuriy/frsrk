import { getEvent, populated, type Municipality } from "@/lib/cms";
import { absoluteUrl } from "@/lib/site";

const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (iso: string) => iso.slice(0, 10).replace(/-/g, "");

function nextDay(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return new Response("Не найдено", { status: 404 });

  const city = populated<Municipality>(event.municipality)?.name;
  const location = [city, event.venue].filter(Boolean).join(", ");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FRSRK//Calendar//RU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}-${event.slug}@frsrk`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(event.dateFrom)}`,
    `DTEND;VALUE=DATE:${nextDay(event.dateTo ?? event.dateFrom)}`,
    `SUMMARY:${esc(event.title)}`,
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    `URL:${absoluteUrl(`/calendar/${event.slug}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
