const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

/** 24 сентября 2026 г. */
export function formatDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_GEN[m - 1]} ${y} г.`;
}

/** 24–26 сентября 2026 г. / 30 сентября – 2 октября 2026 г. */
export function formatRange(from: string, to?: string | null): string {
  if (!to || to.slice(0, 10) === from.slice(0, 10)) return formatDate(from);
  const a = parts(from);
  const b = parts(to);
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${MONTHS_GEN[a.m - 1]} ${a.y} г.`;
  if (a.y === b.y) return `${a.d} ${MONTHS_GEN[a.m - 1]} – ${b.d} ${MONTHS_GEN[b.m - 1]} ${a.y} г.`;
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function monthTitle(iso: string): string {
  const { y, m } = parts(iso);
  return `${MONTHS_NOM[m - 1]} ${y}`;
}

export function dayAndMonth(iso: string): { day: string; month: string } {
  const { d, m } = parts(iso);
  return { day: String(d), month: MONTHS_GEN[m - 1] };
}
