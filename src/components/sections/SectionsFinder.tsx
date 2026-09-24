"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CrimeaMap } from "@/components/sections/CrimeaMap";
import { SEVASTOPOL_NOTE } from "@/lib/constants";

export interface SectionView {
  id: number;
  title: string;
  citySlug: string;
  cityName: string;
  organization?: string;
  address: string;
  coach?: string;
  ages?: string;
  schedule?: string;
  price?: string;
  phone?: string;
  phoneHref?: string;
  messengerUrl?: string;
  disciplines: string[];
  description?: string;
}

export interface MunicipalityView {
  slug: string;
  name: string;
  kind: string;
  count: number;
  rep?: { name: string; position: string; phone?: string; phoneHref?: string };
}

interface Props {
  municipalities: MunicipalityView[];
  sections: SectionView[];
  initialCity?: string | null;
}

const norm = (v: string) => v.toLowerCase().replace(/ё/g, "е");

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "секция";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "секции";
  return "секций";
};

function SectionCard({ s, showCity }: { s: SectionView; showCity: boolean }) {
  return (
    <li className="sec">
      <h3 className="sec__title">{s.title}</h3>
      <div className="sec__meta">
        {showCity ? <span><b>{s.cityName}</b></span> : null}
        {s.organization ? <span>{s.organization}</span> : null}
        <span>{s.address}</span>
        {s.coach ? <span>Тренер: <b>{s.coach}</b></span> : null}
        {s.ages ? <span>Возраст: {s.ages}</span> : null}
        {s.schedule ? <span style={{ whiteSpace: "pre-line" }}>{s.schedule}</span> : null}
        {s.price ? <span>{s.price}</span> : null}
        {s.disciplines.length ? <span>{s.disciplines.join(", ")}</span> : null}
      </div>
      {s.description ? <p style={{ fontSize: "0.92rem" }}>{s.description}</p> : null}
      <div className="sec__actions">
        {s.phoneHref ? (
          <a className="btn btn--red btn--sm" href={s.phoneHref}>
            Позвонить {s.phone}
          </a>
        ) : null}
        {s.messengerUrl ? (
          <a className="btn btn--line btn--sm" href={s.messengerUrl} target="_blank" rel="noopener noreferrer">
            Написать
          </a>
        ) : null}
        <a className="btn btn--line btn--sm" href={`https://yandex.ru/maps/?text=${encodeURIComponent(`${s.cityName}, ${s.address}`)}`} target="_blank" rel="noopener noreferrer">
          Маршрут
        </a>
      </div>
    </li>
  );
}

export function SectionsFinder({ municipalities, sections, initialCity }: Props) {
  const [city, setCity] = useState<string | null>(initialCity && municipalities.some((m) => m.slug === initialCity) ? initialCity : null);
  const [tab, setTab] = useState<"sections" | "rep">("sections");
  const [query, setQuery] = useState("");

  const select = (slug: string | null) => {
    setCity(slug);
    setTab("sections");
    try {
      const url = new URL(window.location.href);
      if (slug) url.searchParams.set("city", slug);
      else url.searchParams.delete("city");
      window.history.replaceState(null, "", url);
    } catch {
      // адресная строка не обновилась: на работу карты это не влияет
    }
  };

  const current = city ? municipalities.find((m) => m.slug === city) : null;
  const q = norm(query.trim());

  const visible = useMemo(
    () =>
      sections.filter((s) => {
        if (city && s.citySlug !== city) return false;
        if (!q) return true;
        return norm([s.title, s.organization, s.address, s.coach, s.cityName].filter(Boolean).join(" ")).includes(q);
      }),
    [sections, city, q],
  );

  const catalog = municipalities.filter((m) => !q || norm(m.name).includes(q));
  const totalCities = municipalities.filter((m) => m.count > 0).length;

  return (
    <>
      <div className="finder">
        <CrimeaMap municipalities={municipalities} selected={city} onSelect={select} />

        <div className="finder__side">
          <div className="search">
            <label className="sr-only" htmlFor="finder-q">
              Поиск по названию, тренеру, адресу или городу
            </label>
            <input id="finder-q" className="search__input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Город, тренер или название секции" />
          </div>

          <section className="panel" aria-live="polite">
            <div className="panel__head">
              <p className="panel__kicker">{current ? "Выбрано на карте" : "Все секции"}</p>
              <h2 className="panel__title">{current ? current.name : sections.length ? `${sections.length} ${plural(sections.length)}` : "Секции пока не добавлены"}</h2>
              <p className="panel__sub">
                {current
                  ? `${current.kind}, ${current.count ? `${current.count} ${plural(current.count)}` : "секций пока нет"}`
                  : sections.length
                    ? `в ${totalCities} муниципальных образованиях Республики Крым`
                    : "Выберите территорию на карте, чтобы узнать, кто отвечает за неё"}
              </p>
            </div>

            {current?.slug === "sevastopol" ? <p className="note panel__note">{SEVASTOPOL_NOTE}</p> : null}

            {current ? (
              <div className="ptabs" role="tablist" aria-label="Что показать">
                <button type="button" role="tab" className="ptabs__btn" aria-selected={tab === "sections"} onClick={() => setTab("sections")}>
                  Секции
                </button>
                <button type="button" role="tab" className="ptabs__btn" aria-selected={tab === "rep"} onClick={() => setTab("rep")}>
                  Представитель
                </button>
                <button type="button" className="ptabs__btn" onClick={() => select(null)}>
                  Показать все
                </button>
              </div>
            ) : null}

            <div className="panel__body">
              {current && tab === "rep" ? (
                current.rep ? (
                  <div className="sec">
                    <h3 className="sec__title">{current.rep.name}</h3>
                    <div className="sec__meta">
                      <span>{current.rep.position}</span>
                    </div>
                    {current.rep.phoneHref ? (
                      <div className="sec__actions">
                        <a className="btn btn--red btn--sm" href={current.rep.phoneHref}>
                          Позвонить {current.rep.phone}
                        </a>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="note">Представитель федерации в этом муниципальном образовании пока не назначен. Если хотите им стать, <Link href="/contacts?topic=join-club">напишите нам</Link>.</p>
                )
              ) : visible.length ? (
                <ul style={{ display: "grid", gap: 12 }}>
                  {visible.map((s) => (
                    <SectionCard key={s.id} s={s} showCity={!current} />
                  ))}
                </ul>
              ) : (
                <p className="note">
                  {current ? `В муниципальном образовании «${current.name}» секций пока нет. ` : "По вашему запросу секций не найдено. "}
                  Хотите открыть секцию? <Link href="/contacts?topic=join-club">Напишите в федерацию</Link>, мы поможем.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="catalog">
        <h2 className="h3" style={{ marginTop: 36 }}>
          Все муниципальные образования
        </h2>
        <div className="catalog__grid">
          {catalog.map((m) => (
            <button key={m.slug} type="button" className="catalog__item" aria-pressed={city === m.slug} onClick={() => select(city === m.slug ? null : m.slug)}>
              <span>
                {m.name}
                {m.slug === "sevastopol" ? "*" : ""}
              </span>
              <span className={`catalog__num${m.count ? "" : " catalog__num--zero"}`}>{m.count}</span>
            </button>
          ))}
        </div>
        {catalog.some((m) => m.slug === "sevastopol") ? <p className="map-note map-note--plain">* {SEVASTOPOL_NOTE}</p> : null}
      </div>
    </>
  );
}
