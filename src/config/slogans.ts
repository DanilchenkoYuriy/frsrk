/** Рукописные надписи на полосе заголовка (на компьютере). */
export const SLOGANS = {
  calendar: "Развиваем спорт вместе",
  event: "Календарь федерации",
  sections: "Спорт доступен каждому",
  documents: "Развиваем спорт вместе",
  rules: "Знаем правила, играем честно",
  audio: "Сила в движении",
  media: "Сила в движении",
  news: "Будьте в курсе",
  antidoping: "Чистый спорт — сильнее",
  about: "Больше, чем спорт",
  history: "Наша история",
  leadership: "Команда федерации",
  requisites: "Открыто и честно",
  coaches: "Развиваем людей — развиваем спорт",
  judges: "Честная оценка, честный спорт",
  parents: "Спорт для всей семьи",
  contacts: "На связи со спортом",
  ranking: "Растим чемпионов",
} as const;

export const PAGE_SLOGANS: Record<string, string> = {
  about: SLOGANS.about,
  history: SLOGANS.history,
  parents: SLOGANS.parents,
  antidoping: SLOGANS.antidoping,
  "education-judges": SLOGANS.judges,
  "education-coaches": SLOGANS.coaches,
  rules: SLOGANS.rules,
};
