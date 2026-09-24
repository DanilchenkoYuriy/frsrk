"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface EventView {
  id: number;
  slug: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  typeLabel: string;
  levelLabel: string;
  place: string;
  status: "upcoming" | "registration" | "ongoing" | "finished";
  statusLabel: string;
  protocols: number;
}

interface Props {
  events: EventView[];
  today: string;
}

const TYPE_COLORS: Record<string, string> = {
  competition: "#f01938",
  festival: "#c99a36",
  seminar: "#1474d4",
  course: "#0b8a4d",
  camp: "#7a4ee0",
  other: "#6b7a90",
};

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s: string) => ({ y: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) - 1, d: Number(s.slice(8, 10)) });

function rangeLabel(from: string, to: string): string {
  const a = parse(from);
  const b = parse(to);
  if (from === to) return `${a.d} ${MONTHS_GEN[a.m]} ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${MONTHS_GEN[a.m]} ${a.y}`;
  return `${a.d} ${MONTHS_GEN[a.m]} – ${b.d} ${MONTHS_GEN[b.m]} ${b.y}`;
}

function statusClass(s: EventView["status"]) {
  return s === "registration" ? "badge badge--green" : s === "finished" ? "badge badge--gray" : s === "ongoing" ? "badge badge--gold" : "badge badge--red";
}

function EventItem({ e }: { e: EventView }) {
  const a = parse(e.dateFrom);
  return (
    <Link href={`/calendar/${e.slug}`} className="ev">
      <div className="ev__date" aria-hidden="true">
        <span className="ev__day">{a.d}</span>
        <span className="ev__month">{MONTHS_GEN[a.m].slice(0, 3)}</span>
      </div>
      <div>
        <p className="ev__title">{e.title}</p>
        <div className="ev__meta">
          <span>{rangeLabel(e.dateFrom, e.dateTo)}</span>
          {e.place ? <span>{e.place}</span> : null}
        </div>
        <div className="ev__badges">
          <span className="badge">{e.typeLabel}</span>
          <span className="badge">{e.levelLabel}</span>
          <span className={statusClass(e.status)}>{e.statusLabel}</span>
          {e.protocols > 0 ? <span className="badge badge--green">Есть протоколы</span> : null}
        </div>
      </div>
      <span className="ev__arrow" aria-hidden="true">→</span>
    </Link>
  );
}

type Mode = "calendar" | "upcoming" | "results";

export function CalendarExplorer({ events, today }: Props) {
  const t = parse(today);
  const [mode, setMode] = useState<Mode>("calendar");
  const [type, setType] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [view, setView] = useState({ y: t.y, m: t.m });
  const [day, setDay] = useState<string | null>(null);

  const types = useMemo(() => {
    const seen = new Map<string, { label: string; n: number }>();
    for (const e of events) seen.set(e.type, { label: e.typeLabel, n: (seen.get(e.type)?.n ?? 0) + 1 });
    return [...seen.entries()];
  }, [events]);

  const filtered = useMemo(() => events.filter((e) => !type || e.type === type), [events, type]);

  const monthStart = iso(view.y, view.m, 1);
  const monthEnd = iso(view.y, view.m, new Date(view.y, view.m + 1, 0).getDate());
  const inMonth = filtered.filter((e) => e.dateFrom <= monthEnd && e.dateTo >= monthStart).sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const listed = day ? inMonth.filter((e) => e.dateFrom <= day && e.dateTo >= day) : inMonth;

  const shiftMonth = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setDay(null);
  };

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const lead = (first.getDay() + 6) % 7;
    const total = Math.ceil((lead + new Date(view.y, view.m + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(view.y, view.m, 1 - lead + i);
      const key = iso(d.getFullYear(), d.getMonth(), d.getDate());
      return { key, num: d.getDate(), out: d.getMonth() !== view.m };
    });
  }, [view]);

  const upcoming = filtered.filter((e) => e.status !== "finished").sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const finished = filtered.filter((e) => e.status === "finished");
  const years = [...new Set(finished.map((e) => parse(e.dateFrom).y))].sort((a, b) => b - a);
  const results = finished.filter((e) => !year || parse(e.dateFrom).y === year).sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));

  const nextUpcoming = upcoming[0];

  const groupByMonth = (list: EventView[]) => {
    const groups: { title: string; items: EventView[] }[] = [];
    for (const e of list) {
      const p = parse(e.dateFrom);
      const title = `${MONTHS[p.m]} ${p.y}`;
      const g = groups.find((x) => x.title === title);
      if (g) g.items.push(e);
      else groups.push({ title, items: [e] });
    }
    return groups;
  };

  return (
    <div>
      <div className="toolbar">
        <div className="tabbar" role="tablist" aria-label="Вид календаря">
          {(
            [
              ["calendar", "Календарь"],
              ["upcoming", `Ближайшие${upcoming.length ? ` · ${upcoming.length}` : ""}`],
              ["results", `Результаты${finished.length ? ` · ${finished.length}` : ""}`],
            ] as [Mode, string][]
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" className="tabbar__btn" aria-selected={mode === id} onClick={() => setMode(id)}>
              {label}
            </button>
          ))}
        </div>
        {types.length > 1 ? (
          <div className="chips" role="group" aria-label="Тип мероприятия">
            <button type="button" className="chip" aria-pressed={!type} onClick={() => setType(null)}>
              Все типы
            </button>
            {types.map(([value, info]) => (
              <button key={value} type="button" className="chip" aria-pressed={type === value} onClick={() => setType(type === value ? null : value)}>
                <span className="chip__dot" style={{ ["--dot" as string]: TYPE_COLORS[value] ?? "#6b7a90" }} />
                {info.label}
                <span className="chip__count">{info.n}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {mode === "calendar" ? (
        <div className="cal">
          <div className="cal__box">
            <div className="cal__head">
              <h2 className="cal__title">
                {MONTHS[view.m]} {view.y}
              </h2>
              <div className="cal__nav">
                <button type="button" className="cal__arrow" onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">
                  ‹
                </button>
                <button type="button" className="cal__today" onClick={() => { setView({ y: t.y, m: t.m }); setDay(null); }}>
                  Сегодня
                </button>
                <button type="button" className="cal__arrow" onClick={() => shiftMonth(1)} aria-label="Следующий месяц">
                  ›
                </button>
              </div>
            </div>
            <div className="cal__grid" role="group" aria-label={`${MONTHS[view.m]} ${view.y}`}>
              {DOW.map((d) => (
                <div key={d} className="cal__dow" aria-hidden="true">
                  {d}
                </div>
              ))}
              {cells.map((c) => {
                const dayEvents = filtered.filter((e) => e.dateFrom <= c.key && e.dateTo >= c.key);
                const has = dayEvents.length > 0;
                const cls = ["cal__day", c.out ? "cal__day--out" : "", has ? "cal__day--has" : "", c.key === today ? "cal__day--today" : "", day === c.key ? "cal__day--sel" : ""].join(" ");
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={cls}
                    disabled={!has}
                    aria-label={`${c.num} ${MONTHS_GEN[parse(c.key).m]}${has ? `, мероприятий: ${dayEvents.length}` : ""}`}
                    aria-pressed={day === c.key}
                    onClick={() => setDay(day === c.key ? null : c.key)}
                  >
                    <span className="cal__num">{c.num}</span>
                    <span className="cal__dots">
                      {[...new Set(dayEvents.map((e) => e.type))].slice(0, 3).map((ty) => (
                        <span key={ty} className="cal__dot" style={{ ["--dot" as string]: TYPE_COLORS[ty] ?? "#6b7a90" }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cal__side" aria-live="polite">
            <div className="cal__side-head">
              <div>
                <h2 className="cal__side-title">{day ? `${parse(day).d} ${MONTHS_GEN[parse(day).m]}` : `События: ${MONTHS[view.m].toLowerCase()}`}</h2>
                <p className="cal__side-sub">{listed.length ? `Мероприятий: ${listed.length}` : "Мероприятий нет"}</p>
              </div>
              {day ? (
                <button type="button" className="btn btn--line btn--sm" onClick={() => setDay(null)}>
                  Весь месяц
                </button>
              ) : null}
            </div>
            {listed.length ? (
              <div>
                {listed.map((e) => (
                  <EventItem key={e.id} e={e} />
                ))}
              </div>
            ) : (
              <div className="cal__empty">
                <p>В этом месяце мероприятий нет.</p>
                {nextUpcoming ? (
                  <button
                    type="button"
                    className="btn btn--blue btn--sm"
                    style={{ marginTop: 14 }}
                    onClick={() => {
                      const p = parse(nextUpcoming.dateFrom);
                      setView({ y: p.y, m: p.m });
                      setDay(null);
                    }}
                  >
                    К ближайшему: {rangeLabel(nextUpcoming.dateFrom, nextUpcoming.dateTo)}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {mode === "upcoming" ? (
        upcoming.length ? (
          groupByMonth(upcoming).map((g) => (
            <section key={g.title}>
              <h2 className="month-title">{g.title}</h2>
              <div className="ev-full">
                {g.items.map((e) => (
                  <EventItem key={e.id} e={e} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="empty">Ближайших мероприятий пока нет.</p>
        )
      ) : null}

      {mode === "results" ? (
        <>
          {years.length > 1 ? (
            <div className="chips" style={{ marginBottom: 16 }} role="group" aria-label="Год">
              <button type="button" className="chip" aria-pressed={!year} onClick={() => setYear(null)}>
                Все годы
              </button>
              {years.map((y) => (
                <button key={y} type="button" className="chip" aria-pressed={year === y} onClick={() => setYear(year === y ? null : y)}>
                  {y}
                </button>
              ))}
            </div>
          ) : null}
          {results.length ? (
            <div className="ev-full">
              {results.map((e) => (
                <EventItem key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <p className="empty">Прошедших мероприятий пока нет.</p>
          )}
        </>
      ) : null}
    </div>
  );
}
