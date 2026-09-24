"use client";

import { useMemo, useState } from "react";

export interface RankRow {
  id: number;
  athlete: string;
  season: string;
  discipline: string;
  disciplineLabel: string;
  ageGroup: string;
  ageLabel: string;
  gender: string;
  genderLabel: string;
  city: string;
  club: string;
  starts: number | null;
  points: number;
}

interface Props {
  rows: RankRow[];
}

const norm = (v: string) => v.toLowerCase().replace(/ё/g, "е");
const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export function RankingExplorer({ rows }: Props) {
  const seasons = useMemo(() => [...new Set(rows.map((r) => r.season))].sort().reverse(), [rows]);
  const [season, setSeason] = useState(seasons[0] ?? "");
  const [discipline, setDiscipline] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const inSeason = useMemo(() => rows.filter((r) => r.season === season), [rows, season]);
  const uniq = <T,>(get: (r: RankRow) => T | "") => [...new Map(inSeason.filter((r) => get(r) !== "").map((r) => [String(get(r)), r])).values()];
  const disciplines = uniq((r) => r.discipline);
  const ages = uniq((r) => r.ageGroup);
  const genders = uniq((r) => r.gender);
  const cities = [...new Set(inSeason.map((r) => r.city).filter(Boolean))].sort();

  const q = norm(query.trim());
  const shown = useMemo(() => {
    const list = inSeason.filter(
      (r) =>
        (!discipline || r.discipline === discipline) &&
        (!age || r.ageGroup === age) &&
        (!gender || r.gender === gender) &&
        (!city || r.city === city) &&
        (!q || norm(`${r.athlete} ${r.city} ${r.club}`).includes(q)),
    );
    const sorted = [...list].sort((a, b) => b.points - a.points || a.athlete.localeCompare(b.athlete, "ru"));
    const placed: (RankRow & { place: number })[] = [];
    sorted.forEach((r, i) => {
      // при равных очках место одно
      const before = placed[i - 1];
      placed.push({ ...r, place: before && before.points === r.points ? before.place : i + 1 });
    });
    return placed;
  }, [inSeason, discipline, age, gender, city, q]);

  const reset = () => {
    setDiscipline("");
    setAge("");
    setGender("");
    setCity("");
    setQuery("");
  };
  const top = shown.slice(0, 3);
  const filtered = Boolean(discipline || age || gender || city || query);

  return (
    <div>
      <section className="rank-filters" aria-label="Параметры рейтинга">
        <div className="rank-filters__grid">
          <label className="field">
            <span className="field__label">Сезон</span>
            <select className="select" value={season} onChange={(e) => { setSeason(e.target.value); reset(); }}>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Дисциплина</span>
            <select className="select" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
              <option value="">Все дисциплины</option>
              {disciplines.map((r) => (
                <option key={r.discipline} value={r.discipline}>
                  {r.disciplineLabel}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Возрастная группа</span>
            <select className="select" value={age} onChange={(e) => setAge(e.target.value)}>
              <option value="">Все группы</option>
              {ages.map((r) => (
                <option key={r.ageGroup} value={r.ageGroup}>
                  {r.ageLabel}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Пол</span>
            <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Все</option>
              {genders.map((r) => (
                <option key={r.gender} value={r.gender}>
                  {r.genderLabel}
                </option>
              ))}
            </select>
          </label>
          {cities.length ? (
            <label className="field">
              <span className="field__label">Муниципальное образование</span>
              <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Все</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="rank-filters__row">
          <div className="search" style={{ flex: 1 }}>
            <label className="sr-only" htmlFor="rank-q">
              Поиск спортсмена
            </label>
            <input id="rank-q" className="search__input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Фамилия, город или клуб" />
          </div>
          {filtered ? (
            <button type="button" className="btn btn--line btn--sm" onClick={reset}>
              Сбросить
            </button>
          ) : null}
        </div>
      </section>

      {top.length > 0 ? (
        <section aria-label="Лидеры" className="podium">
          {top.map((r) => (
            <article key={r.id} className={`podium__card podium__card--${Math.min(r.place, 3)}`}>
              <span className="podium__place">{r.place}</span>
              <span className="podium__avatar" aria-hidden="true">
                {initials(r.athlete)}
              </span>
              <h3 className="podium__name">{r.athlete}</h3>
              <p className="podium__meta">{[r.city, r.club].filter(Boolean).join(", ") || " "}</p>
              <span className="badge">{r.disciplineLabel}</span>
              <p className="podium__points">
                {fmt(r.points)} <span>очков</span>
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <div className="rank-table-wrap">
        <table className="rank-table">
          <caption className="sr-only">Рейтинг спортсменов, сезон {season}</caption>
          <thead>
            <tr>
              <th scope="col">Место</th>
              <th scope="col">Спортсмен</th>
              <th scope="col">Территория, клуб</th>
              <th scope="col">Группа</th>
              <th scope="col">Дисциплина</th>
              <th scope="col" className="num">Старты</th>
              <th scope="col" className="num">Очки</th>
            </tr>
          </thead>
          <tbody>
            {shown.length ? (
              shown.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="rank-place">{r.place}</span>
                  </td>
                  <th scope="row">{r.athlete}</th>
                  <td>
                    {r.city}
                    {r.club ? <span className="rank-sub">{r.club}</span> : null}
                  </td>
                  <td>
                    {r.ageLabel}
                    <span className="rank-sub">{r.genderLabel.split(",")[0]}</span>
                  </td>
                  <td>{r.disciplineLabel}</td>
                  <td className="num">{r.starts ?? "-"}</td>
                  <td className="num">
                    <b>{fmt(r.points)}</b>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="rank-empty">
                  По выбранным параметрам спортсменов нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="rank-note" aria-live="polite">
        Найдено записей: {shown.length}. Места считаются по очкам, при равных очках место одно.
      </p>
    </div>
  );
}
