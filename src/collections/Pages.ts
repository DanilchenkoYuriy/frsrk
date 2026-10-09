import type { Block, CollectionConfig } from "payload";
import { isAdmin, isStaff, publishedOrStaff } from "@/access";
import { DOCUMENT_CATEGORIES, PAGE_KEYS, RESERVED_SLUGS, RESERVED_SUBSLUGS } from "@/lib/constants";
import { slugify } from "@/lib/translit";
import { linkField } from "@/fields/link";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

/** Блоки, из которых собирается вкладка страницы. */
const blocks: Block[] = [
  {
    slug: "text",
    labels: { singular: "Текст", plural: "Тексты" },
    fields: [{ name: "content", type: "richText", label: "Текст", required: true }],
  },
  {
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
  },
  {
    slug: "buttons",
    labels: { singular: "Кнопки", plural: "Кнопки" },
    fields: [
      {
        name: "buttons",
        type: "array",
        label: "Кнопки",
        minRows: 1,
        labels: { singular: "Кнопка", plural: "Кнопки" },
        admin: { components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
        fields: [
          { name: "label", type: "text", label: "Надпись", required: true },
          linkField(),
          {
            name: "style",
            type: "radio",
            label: "Вид",
            defaultValue: "line",
            options: [
              { label: "Красная", value: "red" },
              { label: "С рамкой", value: "line" },
            ],
            admin: { layout: "horizontal" },
          },
        ],
      },
    ],
  },
  {
    slug: "image",
    labels: { singular: "Картинка", plural: "Картинки" },
    fields: [
      { name: "image", type: "upload", relationTo: "media", label: "Картинка", required: true },
      { name: "caption", type: "text", label: "Подпись под картинкой" },
    ],
  },
];

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Текстовая страница", plural: "Текстовые страницы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "key", "slug", "section", "updatedAt", "published"],
    group: "Содержимое",
    description:
      "Тексты разделов («О федерации», «Родителям», «Антидопинг» и другие) и новые страницы. Новая страница: заполните заголовок, адрес и раздел, затем добавьте её в меню («Структура сайта»). Пока текст пустой, на сайте написано, что раздел в разработке.",
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Заголовок страницы", required: true },
    {
      name: "key",
      type: "select",
      label: "Встроенная страница сайта",
      unique: true,
      index: true,
      options: PAGE_KEYS.map(({ value, label }) => ({ value, label })),
      admin: { position: "sidebar", description: "Только для стандартных страниц сайта. У новой страницы оставьте пустым." },
    },
    {
      name: "slug",
      type: "text",
      label: "Адрес страницы (латиницей)",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        condition: (data) => !data?.key,
        description: "Если пусто, адрес сделается из заголовка.",
      },
      hooks: { beforeValidate: [({ value, data }) => (data?.key ? null : slugify(String(value || data?.title || "")) || null)] },
      validate: (value: string | null | undefined, { data }: { data: { key?: string | null; section?: unknown } }) => {
        if (data?.key) return true;
        if (!value) return "Укажите адрес страницы";
        const reserved: readonly string[] = data?.section ? RESERVED_SUBSLUGS : RESERVED_SLUGS;
        if (reserved.includes(value)) return `Адрес «${value}» уже занят другой страницей сайта`;
        return true;
      },
    },
    {
      name: "section",
      type: "relationship",
      relationTo: "site-sections",
      label: "Раздел с меню слева",
      admin: {
        position: "sidebar",
        condition: (data) => !data?.key,
        description: "Страница откроется внутри раздела, по адресу frsrk.ru/раздел/адрес. Не забудьте добавить её в пункты слева у раздела.",
      },
    },
    { name: "lead", type: "textarea", label: "Вводный абзац (1–2 предложения)" },
    {
      name: "body",
      type: "richText",
      label: "Текст страницы",
      admin: {
        description: "Если ниже нет вкладок, а в тексте три и больше заголовков второго уровня, текст сам делится на вкладки по этим заголовкам.",
      },
    },
    {
      name: "tabs",
      type: "array",
      label: "Вкладки",
      labels: { singular: "Вкладка", plural: "Вкладки" },
      admin: {
        description: "Вкладки идут под текстом страницы. В каждой вкладке можно собрать блоки: текст, список документов, кнопки, картинку. Если вкладка одна, заголовков вкладок не будет, только её блоки.",
        initCollapsed: true,
        components: { RowLabel: "@/components/admin/RowLabel#RowLabel" },
      },
      fields: [
        { name: "label", type: "text", label: "Название вкладки", required: true },
        { name: "hidden", type: "checkbox", label: "Скрыть на сайте", defaultValue: false },
        { name: "blocks", type: "blocks", label: "Блоки", labels: { singular: "Блок", plural: "Блоки" }, blocks },
      ],
    },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
