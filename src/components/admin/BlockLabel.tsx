"use client";

import { useRowLabel } from "@payloadcms/ui";

const LABELS: Record<string, string> = {
  hero: "Первый экран",
  text: "Текст",
  textImage: "Текст с картинкой",
  image: "Картинка",
  buttons: "Кнопки",
  documents: "Список документов",
  links: "Список ссылок",
  faq: "Вопрос-ответ",
  people: "Люди",
  video: "Видео",
  tabs: "Вкладки",
  events: "Мероприятия",
  sectionsMap: "Карта секций",
  news: "Новости",
  gallery: "Фото из альбома",
  tiles: "Плитки-ссылки",
  stats: "Федерация в цифрах",
  contactBand: "Полоса «Остались вопросы?»",
  builtin: "Основное содержимое страницы",
};

interface Row {
  blockType?: string;
  title?: string;
  kicker?: string;
  caption?: string;
  hidden?: boolean;
  tabs?: { label?: string }[];
}

/** Заголовок блока в админке: номер, тип, заголовок блока и отметка «скрыт». */
export function BlockLabel() {
  const { data, rowNumber } = useRowLabel<Row>();
  const type = LABELS[data?.blockType ?? ""] ?? "Блок";
  const detail = data?.title || data?.caption || data?.tabs?.map((t) => t.label).filter(Boolean).join(" · ") || "";
  return (
    <span style={{ display: "inline-flex", gap: 10, alignItems: "baseline", opacity: data?.hidden ? 0.5 : 1 }}>
      <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--theme-elevation-500)" }}>{String((rowNumber ?? 0) + 1).padStart(2, "0")}</span>
      <strong>{type}</strong>
      {detail ? <span style={{ color: "var(--theme-elevation-600)" }}>{detail}</span> : null}
      {data?.hidden ? <span style={{ color: "var(--theme-error-500)" }}>скрыт</span> : null}
    </span>
  );
}
