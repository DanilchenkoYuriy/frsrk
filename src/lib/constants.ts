/** Общие справочники: используются и в админке, и на публичных страницах. */

export const DOCUMENT_CATEGORIES = [
  { value: "federation", label: "Устав и аккредитация", description: "Учредительные документы федерации и подтверждение её государственной аккредитации." },
  { value: "rules", label: "Правила вида спорта", description: "Правила соревнований, судейство, положения о судейских конгрессах." },
  { value: "classification", label: "ЕВСК и разряды", description: "Единая всероссийская спортивная классификация, нормы и требования к разрядам." },
  { value: "regulations", label: "Положения и регламенты", description: "Положения о соревнованиях и мероприятиях." },
  { value: "education", label: "Подготовка и обучение", description: "Стандарты и программы спортивной подготовки, материалы для тренеров и судей." },
  { value: "orders", label: "Приказы", description: "Приказы о присвоении судейских категорий и спортивных разрядов, о составе сборной." },
  { value: "antidoping", label: "Антидопинг", description: "Документы по антидопинговому обеспечению." },
  { value: "forms", label: "Формы и бланки", description: "Заявки, анкеты и другие формы." },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const EVENT_TYPES = [
  { value: "competition", label: "Соревнование" },
  { value: "festival", label: "Фестиваль" },
  { value: "seminar", label: "Семинар" },
  { value: "course", label: "Курсы" },
  { value: "camp", label: "Учебно-тренировочные сборы" },
  { value: "other", label: "Другое" },
] as const;

export const EVENT_LEVELS = [
  { value: "municipal", label: "Муниципальный" },
  { value: "republic", label: "Республиканский" },
  { value: "russia", label: "Всероссийский" },
  { value: "international", label: "Международный" },
] as const;

export const EVENT_DOC_KINDS = [
  { value: "regulation", label: "Положение" },
  { value: "rules", label: "Регламент" },
  { value: "invitation", label: "Приглашение" },
  { value: "start-protocol", label: "Стартовый протокол" },
  { value: "final-protocol", label: "Итоговый протокол" },
  { value: "judge-report", label: "Отчёт главного судьи" },
  { value: "security-plan", label: "План обеспечения безопасности (согласование с МВД)" },
  { value: "judges-reference", label: "Справка о судейской коллегии" },
  { value: "photo-report", label: "Фотоотчёт" },
  { value: "other", label: "Другой документ" },
] as const;

/** Спортивные дисциплины по Правилам вида спорта (приказ Минспорта России от 29.03.2022 № 264). */
export const DISCIPLINES = [
  { value: "jumps-30", label: "Прыжки за 30 с" },
  { value: "jumps-180", label: "Прыжки за 180 с" },
  { value: "freestyle", label: "Вольные упражнения" },
  { value: "double-jumps", label: "Прыжки двойные" },
  { value: "triple-jumps", label: "Прыжки тройные" },
  { value: "jumps-4", label: "Прыжки 4 человека" },
  { value: "two-ropes-4", label: "Прыжки через две скакалки 4 человека" },
  { value: "freestyle-group", label: "Вольные упражнения, группа" },
  { value: "two-ropes-1", label: "Прыжки через две скакалки 1 человек" },
  { value: "two-ropes-2", label: "Прыжки через две скакалки 2 человека" },
  { value: "team", label: "Командные соревнования" },
] as const;

export const PAGE_KEYS = [
  { value: "about", label: "О федерации" },
  { value: "history", label: "История" },
  { value: "parents", label: "Родителям" },
  { value: "antidoping", label: "Антидопинг" },
  { value: "rules", label: "Правила вида спорта (текст)" },
  { value: "education-judges", label: "Судейство" },
  { value: "education-coaches", label: "Тренерам" },
  { value: "leadership", label: "Руководство" },
  { value: "privacy", label: "Политика обработки персональных данных" },
  { value: "cookies", label: "Файлы cookie" },
  { value: "media", label: "Медиа" },
] as const;

export const PEOPLE_GROUPS = [
  { value: "leadership", label: "Руководство" },
  { value: "coach", label: "Тренеры" },
  { value: "judge", label: "Судьи" },
  { value: "representative", label: "Представители в муниципалитетах" },
] as const;

export const MUNICIPALITY_KINDS = [
  { value: "city", label: "Городской округ" },
  { value: "district", label: "Муниципальный район" },
  { value: "federal-city", label: "Город федерального значения" },
] as const;

/** Севастополь не входит в Республику Крым: это отдельный субъект Российской Федерации. */
export const SEVASTOPOL_NOTE =
  "Севастополь — субъект Российской Федерации, город федерального значения. Он не входит в состав Республики Крым и показан на карте для удобства поиска.";

export const INQUIRY_TOPICS = [
  { value: "general", label: "Общий вопрос" },
  { value: "join-club", label: "Открыть секцию или клуб" },
  { value: "join-coach", label: "Стать тренером" },
  { value: "join-judge", label: "Стать судьёй" },
  { value: "press", label: "Пресса и СМИ" },
] as const;

export const labelOf = <T extends readonly { value: string; label: string }[]>(list: T, value: string | null | undefined): string =>
  list.find((item) => item.value === value)?.label ?? "";

/** Возрастные группы по Правилам вида спорта. */
export const AGE_GROUPS = [
  { value: "10-11", label: "10–11 лет" },
  { value: "12-14", label: "12–14 лет" },
  { value: "15-17", label: "15–17 лет" },
  { value: "18+", label: "18 лет и старше" },
] as const;

export const GENDERS = [
  { value: "female", label: "Девочки, девушки, женщины" },
  { value: "male", label: "Мальчики, юноши, мужчины" },
] as const;
