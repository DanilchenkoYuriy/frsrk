import { DISCIPLINES, labelOf } from "@/lib/constants";

export const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
};

/** 29 487 (с неразрывным пробелом между тысячами) */
export const formatInt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export const jumpsWord = (n: number) => plural(n, ["прыжок", "прыжка", "прыжков"]);

interface JumpStatInput {
  discipline: string;
  jumps: number;
}

/** Строки статистики прыжков и общая сумма. Итог считается здесь, в админке его вводить не нужно. */
export function jumpStatsOf(stats?: JumpStatInput[] | null) {
  const rows = (stats ?? []).filter((s) => s.jumps > 0).map((s) => ({ label: labelOf(DISCIPLINES, s.discipline), jumps: s.jumps }));
  return { rows, total: rows.reduce((sum, r) => sum + r.jumps, 0) };
}
