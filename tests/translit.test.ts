import { describe, expect, it } from "vitest";
import { safeFilename, slugify } from "@/lib/translit";

describe("slugify", () => {
  it("переводит русский текст в адрес", () => {
    expect(slugify("Кубок Крыма 2026")).toBe("kubok-kryma-2026");
    expect(slugify("Республиканские соревнования. Кубок Крыма")).toBe("respublikanskie-sorevnovaniya-kubok-kryma");
  });
  it("убирает лишние знаки и пробелы", () => {
    expect(slugify("  «Ёлка» & Ко!  ")).toBe("elka-ko");
  });
  it("ограничивает длину и не оставляет дефис в конце", () => {
    const s = slugify("а".repeat(200), 20);
    expect(s.length).toBeLessThanOrEqual(20);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("safeFilename", () => {
  it("делает латинское имя со случайным хвостом и сохраняет расширение", () => {
    expect(safeFilename("Приказ № 17-р.PDF", "abc123")).toBe("prikaz-17-r-abc123.pdf");
  });
  it("не падает на файле без имени", () => {
    expect(safeFilename("«»", "z9")).toBe("file-z9");
  });
});
