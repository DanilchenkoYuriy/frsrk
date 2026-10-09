import { APIError, type CollectionConfig } from "payload";
import { isAdmin, isStaff, publishedOrStaff } from "@/access";
import { PAGE_KINDS, RESERVED_SLUGS, RESERVED_SUBSLUGS, pageKindOf } from "@/lib/constants";
import { slugify } from "@/lib/translit";
import { PAGE_BLOCKS, allowedBlocks } from "@/blocks";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

type Data = { kind?: string | null; parent?: unknown; layout?: { blockType?: string }[] | null };

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Страница", plural: "Страницы сайта" },
  orderable: true,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "parent", "showInMenu", "published", "updatedAt"],
    group: "Структура сайта",
    listSearchableFields: ["title"],
    description:
      "Все страницы сайта. Порядок в списке и есть порядок в меню: перетаскивайте строки за значок слева. Страница с «Родительской страницей» становится пунктом меню слева внутри раздела. Откройте страницу, чтобы менять её блоки.",
    components: { beforeListTable: ["@/components/admin/PagesTree#PagesTree"] },
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isAdmin },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeDelete: [
      async ({ id, req }) => {
        const page = await req.payload.findByID({ collection: "pages", id, depth: 0, req });
        if (page.kind && page.kind !== "custom") {
          throw new APIError("Встроенную страницу сайта удалить нельзя. Её можно скрыть: снимите «Показывать на сайте» или «Показывать в меню».", 400, null, true);
        }
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Блоки",
          description: "Блоки идут на странице сверху вниз в этом порядке. Перетаскивайте их за значок слева, скрывайте галочкой внутри блока, добавляйте кнопкой «Добавить блок».",
          fields: [
            {
              name: "layout",
              type: "blocks",
              label: "Блоки страницы",
              labels: { singular: "блок", plural: "блоки" },
              blocks: PAGE_BLOCKS,
              admin: { initCollapsed: true },
              filterOptions: ({ data }) => allowedBlocks((data as Data)?.kind),
              validate: (value: unknown, { data }: { data: Partial<Data> }) => {
                const kind = pageKindOf(data?.kind);
                const blocks = (value ?? []) as { blockType?: string }[];
                if (kind?.builtin && !blocks.some((b) => b.blockType === "builtin")) {
                  return "На этой странице должен остаться блок «Основное содержимое страницы»: без него пропадёт главное (список, карта, форма). Его можно скрыть галочкой внутри блока.";
                }
                return true;
              },
            },
          ],
        },
        {
          label: "Полоса заголовка",
          description: "Тёмная полоса с картинкой в начале страницы.",
          admin: { condition: (data) => data?.kind !== "home" },
          fields: [
            { name: "lead", type: "textarea", label: "Текст под заголовком (1–2 предложения)" },
            { name: "banner", type: "upload", relationTo: "media", label: "Картинка полосы", admin: { description: "Если пусто, берётся картинка раздела, а если её нет, из «Данные федерации → Полосы заголовков»." } },
            { name: "slogan", type: "text", label: "Рукописная надпись справа (видна на компьютере)" },
          ],
        },
        {
          label: "Для поисковиков",
          fields: [
            { name: "metaTitle", type: "text", label: "Заголовок во вкладке браузера и в поиске", admin: { description: "Если пусто, берётся заголовок страницы." } },
            { name: "metaDescription", type: "textarea", label: "Описание для Яндекса и Google", admin: { description: "Если пусто, берётся текст под заголовком." } },
          ],
        },
      ],
    },
    { name: "title", type: "text", label: "Заголовок страницы", required: true, admin: { position: "sidebar" } },
    { name: "menuLabel", type: "text", label: "Название в меню", admin: { position: "sidebar", description: "Если отличается от заголовка." } },
    {
      name: "kind",
      type: "select",
      label: "Тип страницы",
      defaultValue: "custom",
      index: true,
      options: [{ label: "Обычная страница", value: "custom" }, ...PAGE_KINDS.map(({ value, label }) => ({ value, label: `Встроенная: ${label}` }))],
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "pages",
      label: "Родительская страница (раздел)",
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: {
        position: "sidebar",
        description: "Выберите раздел, например «О федерации», и страница появится в меню слева этого раздела. Пусто: страница верхнего уровня.",
      },
    },
    {
      name: "slug",
      type: "text",
      label: "Адрес (латиницей)",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        condition: (data) => (data?.kind ?? "custom") === "custom",
        description: "Если пусто, сделается из заголовка. Полный адрес: адрес раздела + этот адрес.",
      },
      hooks: { beforeValidate: [({ value, data }) => ((data?.kind ?? "custom") === "custom" ? slugify(String(value || data?.title || "")) || null : null)] },
      validate: (value: string | null | undefined, { data }: { data: Partial<Data> }) => {
        if ((data?.kind ?? "custom") !== "custom") return true;
        if (!value) return "Укажите адрес страницы";
        const reserved: readonly string[] = data?.parent ? RESERVED_SUBSLUGS : RESERVED_SLUGS;
        if (reserved.includes(value)) return `Адрес «${value}» уже занят другой страницей сайта`;
        return true;
      },
    },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: true, admin: { position: "sidebar" } },
    { name: "showInMenu", type: "checkbox", label: "Показывать в меню", defaultValue: true, admin: { position: "sidebar" } },
    {
      name: "dropdown",
      type: "checkbox",
      label: "Подпункты выпадающим списком в верхнем меню",
      defaultValue: false,
      admin: { position: "sidebar", condition: (data) => !data?.parent },
    },
    {
      name: "alsoInTopMenu",
      type: "checkbox",
      label: "Показывать ещё и в верхнем меню",
      defaultValue: false,
      admin: { position: "sidebar", condition: (data) => Boolean(data?.parent), description: "Как «Антидопинг»: страница живёт в разделе, но ссылка на неё есть и наверху." },
    },
  ],
};
