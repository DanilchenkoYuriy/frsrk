export interface SideItem {
  label: string;
  href: string;
}

export interface SectionConfig {
  title: string;
  items: readonly SideItem[];
}

/** Раздел «Участникам»: слева пункты, справа содержимое. */
export const PARTICIPANTS: SectionConfig = {
  title: "Участникам",
  items: [
    { label: "Тренерам", href: "/participants/coaches" },
    { label: "Судьям", href: "/participants/judges" },
    { label: "Родителям", href: "/participants/parents" },
    { label: "Рейтинг спортсменов", href: "/participants/ranking" },
    { label: "Антидопинг", href: "/participants/antidoping" },
  ],
};

/** Раздел «О федерации». */
export const ABOUT: SectionConfig = {
  title: "О федерации",
  items: [
    { label: "О федерации", href: "/about" },
    { label: "Руководство", href: "/about/leadership" },
    { label: "Реквизиты", href: "/about/requisites" },
    { label: "История", href: "/about/history" },
  ],
};

export const SECTIONS = { participants: PARTICIPANTS, about: ABOUT } as const;
export type SectionKey = keyof typeof SECTIONS;
