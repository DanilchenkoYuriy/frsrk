/** Статус мероприятия вычисляется по датам и не хранится в базе. */
export type EventStatus = "upcoming" | "registration" | "ongoing" | "finished";

export interface StatusInput {
  dateFrom: string;
  dateTo?: string | null;
  registrationUrl?: string | null;
  registrationDeadline?: string | null;
}

const day = (iso: string) => iso.slice(0, 10);

export function todayIso(now = new Date(), timeZone = "Europe/Simferopol"): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(now);
}

export function eventStatus(event: StatusInput, today = todayIso()): EventStatus {
  const from = day(event.dateFrom);
  const to = day(event.dateTo || event.dateFrom);
  if (today > to) return "finished";
  if (today >= from) return "ongoing";
  const deadline = event.registrationDeadline ? day(event.registrationDeadline) : null;
  if (event.registrationUrl && (!deadline || today <= deadline)) return "registration";
  return "upcoming";
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Предстоит",
  registration: "Идёт регистрация",
  ongoing: "Проходит сейчас",
  finished: "Завершено",
};
