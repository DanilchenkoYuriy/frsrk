import { describe, expect, it } from "vitest";
import { eventStatus, todayIso } from "@/lib/status";

const base = { dateFrom: "2026-10-10T00:00:00.000Z", dateTo: "2026-10-12T00:00:00.000Z" };

describe("eventStatus", () => {
  it("предстоит без регистрации", () => {
    expect(eventStatus(base, "2026-09-24")).toBe("upcoming");
  });
  it("регистрация открыта до срока включительно", () => {
    const e = { ...base, registrationUrl: "https://example.ru", registrationDeadline: "2026-10-01T00:00:00.000Z" };
    expect(eventStatus(e, "2026-10-01")).toBe("registration");
    expect(eventStatus(e, "2026-10-02")).toBe("upcoming");
  });
  it("идёт в дни проведения", () => {
    expect(eventStatus(base, "2026-10-11")).toBe("ongoing");
    expect(eventStatus(base, "2026-10-12")).toBe("ongoing");
  });
  it("завершено на следующий день после окончания", () => {
    expect(eventStatus(base, "2026-10-13")).toBe("finished");
  });
  it("однодневное мероприятие без даты окончания", () => {
    expect(eventStatus({ dateFrom: "2026-09-19" }, "2026-09-20")).toBe("finished");
  });
});

describe("todayIso", () => {
  it("возвращает дату по Симферополю", () => {
    expect(todayIso(new Date("2026-09-24T22:30:00Z"))).toBe("2026-09-25");
  });
});
