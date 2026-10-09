import type { Block, Field } from "payload";
import { DOCUMENT_CATEGORIES, PEOPLE_GROUPS, pageKindOf } from "@/lib/constants";
import { linkField } from "@/fields/link";

/**
 * Библиотека блоков, из которых собираются страницы сайта (поле «Блоки» у страницы).
 * Вывод на сайте: src/components/blocks.
 */

const hidden: Field = {
  name: "hidden",
  type: "checkbox",
  label: "Скрыть блок на сайте",
  defaultValue: false,
  admin: { description: "Блок останется в админке, но посетители его не увидят." },
};

/** Маленькая подпись над заголовком (красная черта и капс) и сам заголовок. */
const heading = (kicker = "", title = ""): Field[] => [
  {
    type: "row",
    fields: [
      { name: "kicker", type: "text", label: "Надпись над заголовком", defaultValue: kicker || undefined, admin: { width: "40%" } },
      { name: "title", type: "text", label: "Заголовок блока", defaultValue: title || undefined, admin: { width: "60%" } },
    ],
  },
];

const RowLabel = "@/components/admin/RowLabel#RowLabel";
const BlockLabel = "@/components/admin/BlockLabel#BlockLabel";

/** Общее для всех блоков: галочка «Скрыть», подпись в списке, схема в окне «Добавить блок», группа «Основа» по умолчанию. */
const block = (b: Block): Block => ({
  ...b,
  imageURL: `/admin/blocks/${b.slug}.svg`,
  imageAltText: "",
  fields: [...b.fields, hidden],
  admin: { group: "Основа", ...b.admin, components: { Label: BlockLabel, ...b.admin?.components } },
});

const button = (styles: { label: string; value: string }[]): Field => ({
  name: "buttons",
  type: "array",
  label: "Кнопки",
  labels: { singular: "Кнопка", plural: "Кнопки" },
  admin: { components: { RowLabel } },
  fields: [
    { name: "label", type: "text", label: "Надпись", required: true },
    linkField(),
    { name: "style", type: "radio", label: "Вид", defaultValue: styles[0].value, options: styles, admin: { layout: "horizontal" } },
  ],
});

/* Простые блоки: их можно ставить и во вкладки */

export const TextBlock = block({
  slug: "text",
  labels: { singular: "Текст", plural: "Тексты" },
  fields: [
    { name: "content", type: "richText", label: "Текст", required: true },
    {
      name: "splitTabs",
      type: "checkbox",
      label: "Делить на вкладки по заголовкам",
      defaultValue: false,
      admin: { description: "Если в тексте три и больше заголовков второго уровня, каждый станет отдельной вкладкой." },
    },
  ],
});

export const TextImageBlock = block({
  slug: "textImage",
  labels: { singular: "Текст с картинкой", plural: "Тексты с картинкой" },
  fields: [
    ...heading(),
    { name: "content", type: "richText", label: "Текст", required: true },
    { name: "image", type: "upload", relationTo: "media", label: "Картинка", required: true },
    {
      name: "imageSide",
      type: "radio",
      label: "Картинка",
      defaultValue: "right",
      options: [
        { label: "Справа", value: "right" },
        { label: "Слева", value: "left" },
      ],
      admin: { layout: "horizontal" },
    },
  ],
});

export const ImageBlock = block({
  slug: "image",
  labels: { singular: "Картинка", plural: "Картинки" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", label: "Картинка", required: true },
    { name: "caption", type: "text", label: "Подпись под картинкой" },
  ],
});

export const ButtonsBlock = block({
  slug: "buttons",
  labels: { singular: "Кнопки", plural: "Кнопки" },
  fields: [
    button([
      { label: "С рамкой", value: "line" },
      { label: "Красная", value: "red" },
    ]),
  ],
});

export const DocumentsBlock = block({
  slug: "documents",
  labels: { singular: "Список документов", plural: "Списки документов" },
  fields: [
    { name: "title", type: "text", label: "Заголовок над списком" },
    {
      name: "mode",
      type: "radio",
      label: "Какие документы показать",
      defaultValue: "category",
      options: [
        { label: "Все из раздела документов", value: "category" },
        { label: "Выбрать вручную", value: "manual" },
      ],
      admin: { layout: "horizontal" },
    },
    {
      name: "category",
      type: "select",
      label: "Раздел документов",
      options: DOCUMENT_CATEGORIES.map(({ value, label }) => ({ value, label })),
      admin: { condition: (_, sibling) => (sibling?.mode ?? "category") === "category" },
    },
    {
      name: "documents",
      type: "relationship",
      relationTo: "documents",
      hasMany: true,
      label: "Документы",
      admin: { condition: (_, sibling) => sibling?.mode === "manual" },
    },
  ],
});

export const LinksBlock = block({
  slug: "links",
  labels: { singular: "Список ссылок", plural: "Списки ссылок" },
  fields: [
    { name: "title", type: "text", label: "Заголовок над списком" },
    {
      name: "items",
      type: "array",
      label: "Ссылки",
      minRows: 1,
      labels: { singular: "Ссылка", plural: "Ссылки" },
      admin: { components: { RowLabel } },
      fields: [
        { name: "title", type: "text", label: "Название", required: true },
        { name: "text", type: "text", label: "Пояснение" },
        { name: "url", type: "text", label: "Ссылка", required: true },
      ],
    },
  ],
});

export const FaqBlock = block({
  slug: "faq",
  labels: { singular: "Вопрос-ответ", plural: "Вопросы-ответы" },
  fields: [
    { name: "title", type: "text", label: "Заголовок блока" },
    {
      name: "items",
      type: "array",
      label: "Вопросы",
      minRows: 1,
      labels: { singular: "Вопрос", plural: "Вопросы" },
      admin: { components: { RowLabel } },
      fields: [
        { name: "title", type: "text", label: "Вопрос", required: true },
        { name: "answer", type: "textarea", label: "Ответ", required: true },
      ],
    },
  ],
});

export const PeopleBlock = block({
  slug: "people",
  labels: { singular: "Люди", plural: "Люди" },
  fields: [
    { name: "title", type: "text", label: "Заголовок блока" },
    { name: "group", type: "select", label: "Кого показать", required: true, options: PEOPLE_GROUPS.map(({ value, label }) => ({ value, label })) },
  ],
});

export const VideoBlock = block({
  slug: "video",
  labels: { singular: "Видео", plural: "Видео" },
  fields: [
    { name: "title", type: "text", label: "Заголовок блока" },
    { name: "videos", type: "relationship", relationTo: "videos", hasMany: true, required: true, label: "Видео" },
  ],
});

const simpleBlocks = [TextBlock, TextImageBlock, ImageBlock, ButtonsBlock, DocumentsBlock, LinksBlock, FaqBlock, PeopleBlock, VideoBlock];

export const TabsBlock = block({
  slug: "tabs",
  labels: { singular: "Вкладки", plural: "Вкладки" },
  fields: [
    {
      name: "tabs",
      type: "array",
      label: "Вкладки",
      minRows: 1,
      labels: { singular: "Вкладка", plural: "Вкладки" },
      admin: { components: { RowLabel } },
      fields: [
        { name: "label", type: "text", label: "Название вкладки", required: true },
        { name: "hidden", type: "checkbox", label: "Скрыть вкладку на сайте", defaultValue: false },
        { name: "content", type: "blocks", label: "Блоки во вкладке", labels: { singular: "блок", plural: "блоки" }, blocks: simpleBlocks },
      ],
    },
  ],
});

/* Блоки с данными федерации: на главной идут во всю ширину, на других страницах внутри колонки */

export const HeroBlock = block({
  slug: "hero",
  labels: { singular: "Первый экран", plural: "Первые экраны" },
  admin: { group: "Главная" },
  fields: [
    { name: "title", type: "text", label: "Заголовок", required: true },
    { name: "lead", type: "textarea", label: "Текст под заголовком" },
    {
      name: "mode",
      type: "radio",
      label: "Фон",
      defaultValue: "photo",
      options: [
        { label: "Фото", value: "photo" },
        { label: "Видео", value: "video" },
      ],
      admin: { layout: "horizontal" },
    },
    { name: "image", type: "upload", relationTo: "media", label: "Фото", admin: { description: "Оно же показывается, пока грузится видео." } },
    {
      name: "video",
      type: "upload",
      relationTo: "videos",
      label: "Видео",
      admin: {
        condition: (_, sibling) => sibling?.mode === "video",
        description: "Загруженный файл MP4 из «Видео». Лучше ролик 10–20 секунд, 1920×1080, до 8 МБ. Звука на сайте нет.",
      },
    },
    {
      name: "videoMobile",
      type: "checkbox",
      label: "Показывать видео и на телефонах",
      defaultValue: false,
      admin: { condition: (_, sibling) => sibling?.mode === "video", description: "По умолчанию на телефонах фото, чтобы не тратить мобильный трафик посетителей." },
    },
    button([
      { label: "Красная", value: "red" },
      { label: "Белая", value: "light" },
    ]),
  ],
});

export const EventsBlock = block({
  slug: "events",
  labels: { singular: "Мероприятия", plural: "Мероприятия" },
  admin: { group: "Данные федерации" },
  fields: [
    ...heading("Календарь", "Ближайшие мероприятия"),
    {
      name: "mode",
      type: "radio",
      label: "Какие мероприятия показывать",
      defaultValue: "auto",
      options: [
        { label: "Автоматически: ближайшие и последнее прошедшее", value: "auto" },
        { label: "Выбрать вручную", value: "manual" },
      ],
    },
    { name: "featured", type: "relationship", relationTo: "events", label: "Большой блок слева", admin: { condition: (_, s) => s?.mode === "manual" } },
    {
      name: "side",
      type: "relationship",
      relationTo: "events",
      hasMany: true,
      label: "Справа сверху",
      admin: { condition: (_, s) => s?.mode === "manual", description: "Одно или два мероприятия. Можно оставить пустым." },
    },
    {
      name: "recent",
      type: "relationship",
      relationTo: "events",
      label: "«Недавно прошло»",
      admin: { condition: (_, s) => s?.mode === "manual", description: "Если пусто, этого блока не будет." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Фото в большом блоке слева",
      admin: { description: "Горизонтальная фотография, поверх неё затемнение, чтобы текст читался. Если пусто, блок синий." },
    },
  ],
});

export const SectionsMapBlock = block({
  slug: "sectionsMap",
  labels: { singular: "Карта секций", plural: "Карты секций" },
  admin: { group: "Данные федерации" },
  fields: [...heading("Где заниматься", "Найдите секцию рядом с домом")],
});

export const NewsBlock = block({
  slug: "news",
  labels: { singular: "Новости", plural: "Новости" },
  admin: { group: "Данные федерации" },
  fields: [...heading("Новости", "Что нового в федерации"), { name: "count", type: "number", label: "Сколько последних новостей показать", defaultValue: 3, min: 1, max: 12 }],
});

export const GalleryBlock = block({
  slug: "gallery",
  labels: { singular: "Фото из альбома", plural: "Фото из альбомов" },
  admin: { group: "Данные федерации" },
  fields: [
    ...heading("Медиа", "Как это выглядит"),
    { name: "gallery", type: "relationship", relationTo: "galleries", label: "Фотоальбом", admin: { description: "Если пусто, берётся самый свежий альбом." } },
  ],
});

export const TilesBlock = block({
  slug: "tiles",
  labels: { singular: "Плитки-ссылки", plural: "Плитки-ссылки" },
  admin: { group: "Данные федерации" },
  fields: [
    ...heading(),
    { type: "row", fields: [{ name: "moreLabel", type: "text", label: "Ссылка справа от заголовка", admin: { width: "40%" } }] },
    linkField({ name: "moreLink", label: "Куда ведёт ссылка справа", admin: { condition: (_, s) => Boolean(s?.moreLabel) } }),
    {
      name: "items",
      type: "array",
      label: "Плитки",
      minRows: 1,
      labels: { singular: "Плитка", plural: "Плитки" },
      admin: { components: { RowLabel } },
      fields: [
        {
          name: "icon",
          type: "select",
          label: "Значок",
          defaultValue: "scroll",
          options: [
            { label: "Свиток", value: "scroll" },
            { label: "Книга", value: "book" },
            { label: "Медаль", value: "medal" },
            { label: "Нота", value: "music" },
            { label: "Шапочка выпускника", value: "cap" },
            { label: "Щит", value: "shield" },
            { label: "Метка на карте", value: "pin" },
            { label: "Флаг", value: "flag" },
            { label: "Календарь", value: "calendar" },
          ],
        },
        { name: "title", type: "text", label: "Название", required: true },
        { name: "text", type: "text", label: "Пояснение" },
        linkField(),
      ],
    },
  ],
});

export const StatsBlock = block({
  slug: "stats",
  labels: { singular: "Федерация в цифрах", plural: "Федерация в цифрах" },
  admin: { group: "Данные федерации" },
  fields: [
    {
      name: "note",
      type: "ui",
      admin: { components: { Field: "@/components/admin/BlockNote#BlockNote" }, custom: { text: "Цифры считаются сами: секции, муниципальные образования, мероприятия, документы." } },
    },
  ],
});

export const ContactBandBlock = block({
  slug: "contactBand",
  labels: { singular: "Полоса «Остались вопросы?»", plural: "Полосы «Остались вопросы?»" },
  admin: { group: "Данные федерации" },
  fields: [
    { name: "title", type: "text", label: "Заголовок", defaultValue: "Остались вопросы?" },
    { name: "text", type: "textarea", label: "Текст" },
    { name: "buttonLabel", type: "text", label: "Надпись на кнопке", defaultValue: "Написать в федерацию" },
    linkField({ name: "buttonLink", label: "Куда ведёт кнопка" }),
  ],
});

export const BuiltinBlock = block({
  slug: "builtin",
  labels: { singular: "Основное содержимое страницы", plural: "Основное содержимое страницы" },
  admin: { group: "Особые" },
  fields: [
    {
      name: "note",
      type: "ui",
      admin: {
        components: { Field: "@/components/admin/BlockNote#BlockNote" },
        custom: { text: "Здесь выводится то, что сайт собирает сам: календарь, документы, карта секций, форма и т. п. Блок можно перетащить выше или ниже других блоков." },
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Текст правил (делится на вкладки по заголовкам второго уровня)",
      admin: { condition: (data) => data?.kind === "rules" },
    },
  ],
});

/** Все блоки страницы. Первый экран только на главной, основное содержимое только у встроенных страниц. */
export const PAGE_BLOCKS = [
  HeroBlock,
  ...simpleBlocks,
  TabsBlock,
  EventsBlock,
  SectionsMapBlock,
  NewsBlock,
  GalleryBlock,
  TilesBlock,
  StatsBlock,
  ContactBandBlock,
  BuiltinBlock,
];

export const allowedBlocks = (kind: string | null | undefined): string[] =>
  PAGE_BLOCKS.map((b) => b.slug).filter((slug) => (slug === "hero" ? kind === "home" : slug === "builtin" ? Boolean(pageKindOf(kind)?.builtin) : true));
