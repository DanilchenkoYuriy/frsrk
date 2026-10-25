import type { SectionView } from "@/components/sections/SectionsFinder";

/** Карточка секции: адрес, тренер, расписание, кнопки звонка и маршрута. */
export function SectionCard({ s, showCity }: { s: SectionView; showCity: boolean }) {
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

/** Склонение слова «секция» после числа. */
export function sectionsWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "секция";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "секции";
  return "секций";
}
