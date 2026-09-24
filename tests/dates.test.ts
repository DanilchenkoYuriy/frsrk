import { describe, expect, it } from "vitest";
import { dayAndMonth, formatDate, formatRange } from "@/lib/dates";

describe("даты", () => {
  it("форматирует одну дату", () => {
    expect(formatDate("2026-09-24T00:00:00.000Z")).toBe("24 сентября 2026 г.");
  });
  it("сворачивает диапазон в одном месяце", () => {
    expect(formatRange("2026-11-13", "2026-11-16")).toBe("13–16 ноября 2026 г.");
  });
  it("показывает оба месяца, если они разные", () => {
    expect(formatRange("2026-09-30", "2026-10-02")).toBe("30 сентября – 2 октября 2026 г.");
  });
  it("одна дата, если конец совпадает с началом", () => {
    expect(formatRange("2026-09-19", "2026-09-19")).toBe("19 сентября 2026 г.");
  });
  it("день и месяц для плитки", () => {
    expect(dayAndMonth("2026-11-13")).toEqual({ day: "13", month: "ноября" });
  });
});
