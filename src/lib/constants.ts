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

/** Интерактивные схемы для блока «Интерактивная схема». Сами схемы лежат в public/tools. */
export const SCHEMES = [{ value: "dd-relay", label: "Прыжки через 2 скакалки 4 человека (эстафета)", src: "/tools/dd-relay/index.html" }] as const;

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

/** Встроенные страницы сайта: их можно выбрать в меню и ссылках, не вписывая адрес вручную. */
export const SITE_ROUTES = [
  { value: "home", label: "Главная", href: "/" },
  { value: "calendar", label: "Календарь", href: "/calendar" },
  { value: "documents", label: "Документы", href: "/documents" },
  { value: "rules", label: "Документы → Правила вида спорта", href: "/documents/rules" },
  { value: "audio", label: "Документы → Музыка для соревнований", href: "/documents/audio" },
  { value: "news", label: "Новости", href: "/news" },
  { value: "media", label: "Медиа", href: "/media" },
  { value: "sections", label: "Найти секцию", href: "/sections" },
  { value: "contacts", label: "Контакты", href: "/contacts" },
  { value: "participants", label: "Участникам", href: "/participants" },
  { value: "coaches", label: "Участникам → Тренерам", href: "/participants/coaches" },
  { value: "judges", label: "Участникам → Судьям", href: "/participants/judges" },
  { value: "parents", label: "Участникам → Родителям", href: "/participants/parents" },
  { value: "ranking", label: "Участникам → Рейтинг спортсменов", href: "/participants/ranking" },
  { value: "antidoping", label: "Участникам → Антидопинг", href: "/participants/antidoping" },
  { value: "about", label: "О федерации", href: "/about" },
  { value: "leadership", label: "О федерации → Руководство", href: "/about/leadership" },
  { value: "requisites", label: "О федерации → Реквизиты", href: "/about/requisites" },
  { value: "history", label: "О федерации → История", href: "/about/history" },
  { value: "privacy", label: "Политика обработки персональных данных", href: "/legal/privacy" },
  { value: "cookies", label: "Файлы cookie", href: "/legal/cookies" },
] as const;

export type SiteRoute = (typeof SITE_ROUTES)[number]["value"];

export const routeHref = (value: string | null | undefined): string | null => SITE_ROUTES.find((r) => r.value === value)?.href ?? null;

export const SOCIAL_NETWORKS = [
  { value: "vk", label: "ВКонтакте" },
  { value: "telegram", label: "Telegram" },
  { value: "max", label: "Max" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Другая (своя иконка)" },
] as const;

/**
 * Встроенные страницы сайта. У каждой постоянный адрес и своё основное содержимое
 * (список мероприятий, карта секций, форма и т. п.), вокруг которого в админке собираются блоки.
 * parent задаёт место в дереве страниц по умолчанию (используется при первом заполнении).
 */
export const PAGE_KINDS = [
  { value: "home", label: "Главная", href: "/", builtin: false },
  { value: "calendar", label: "Календарь", href: "/calendar", builtin: true },
  { value: "documents", label: "Документы", href: "/documents", builtin: true },
  { value: "rules", label: "Правила вида спорта", href: "/documents/rules", builtin: true, parent: "documents" },
  { value: "audio", label: "Музыка для соревнований", href: "/documents/audio", builtin: true, parent: "documents" },
  { value: "news", label: "Новости", href: "/news", builtin: true },
  { value: "media", label: "Медиа", href: "/media", builtin: true },
  { value: "participants", label: "Участникам", href: "/participants", builtin: false },
  { value: "coaches", label: "Тренерам", href: "/participants/coaches", builtin: false, parent: "participants" },
  { value: "judges", label: "Судьям", href: "/participants/judges", builtin: false, parent: "participants" },
  { value: "parents", label: "Родителям", href: "/participants/parents", builtin: false, parent: "participants" },
  { value: "ranking", label: "Рейтинг спортсменов", href: "/participants/ranking", builtin: true, parent: "participants" },
  { value: "antidoping", label: "Антидопинг", href: "/participants/antidoping", builtin: false, parent: "participants" },
  { value: "about", label: "О федерации", href: "/about", builtin: false },
  { value: "leadership", label: "Руководство", href: "/about/leadership", builtin: true, parent: "about" },
  { value: "requisites", label: "Реквизиты", href: "/about/requisites", builtin: true, parent: "about" },
  { value: "history", label: "История", href: "/about/history", builtin: false, parent: "about" },
  { value: "contacts", label: "Контакты", href: "/contacts", builtin: true },
  { value: "sections", label: "Найти секцию", href: "/sections", builtin: true },
  { value: "privacy", label: "Политика обработки персональных данных", href: "/legal/privacy", builtin: false },
  { value: "cookies", label: "Файлы cookie", href: "/legal/cookies", builtin: false },
] as const;

export type PageKind = (typeof PAGE_KINDS)[number]["value"];

export const pageKindOf = (value: string | null | undefined) => PAGE_KINDS.find((k) => k.value === value);

/** Первые части адреса, уже занятые сайтом: новые страницы так называться не могут. */
export const RESERVED_SLUGS = ["admin", "api", "brand", "fonts", "legal", "robots.txt", "sitemap.xml", "favicon.ico", ...PAGE_KINDS.map((k) => k.href.split("/")[1]).filter(Boolean)];

/** Части адреса внутри встроенных разделов, занятые встроенными страницами. */
export const RESERVED_SUBSLUGS = [...PAGE_KINDS.map((k) => k.href.split("/")[2]).filter(Boolean), "photos"];
