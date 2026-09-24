export interface NavItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}

/** Основное меню и отдельная красная кнопка «Найти секцию». */
export const mainNav: readonly NavItem[] = [
  { label: "Главная", href: "/" },
  { label: "Календарь", href: "/calendar" },
  { label: "Документы", href: "/documents" },
  { label: "Новости", href: "/news" },
  { label: "Медиа", href: "/media" },
  { label: "Участникам", href: "/participants" },
  { label: "О федерации", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

export const ctaNav = { label: "Найти секцию", href: "/sections" } as const;

export const footerColumns: readonly { title: string; links: readonly { label: string; href: string }[] }[] = [
  {
    title: "Федерация",
    links: [
      { label: "О федерации", href: "/about" },
      { label: "Руководство", href: "/about/leadership" },
      { label: "Реквизиты", href: "/about/requisites" },
      { label: "История", href: "/about/history" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  {
    title: "Участникам",
    links: [
      { label: "Найти секцию", href: "/sections" },
      { label: "Тренерам", href: "/participants/coaches" },
      { label: "Судьям", href: "/participants/judges" },
      { label: "Родителям", href: "/participants/parents" },
      { label: "Рейтинг спортсменов", href: "/participants/ranking" },
      { label: "Антидопинг", href: "/participants/antidoping" },
    ],
  },
  {
    title: "Материалы",
    links: [
      { label: "Календарь", href: "/calendar" },
      { label: "Документы", href: "/documents" },
      { label: "Правила вида спорта", href: "/documents/rules" },
      { label: "Музыка для соревнований", href: "/documents/audio" },
      { label: "Новости", href: "/news" },
      { label: "Медиа", href: "/media" },
    ],
  },
];
