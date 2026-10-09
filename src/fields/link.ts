import type { Field, GroupField } from "payload";
import { SITE_ROUTES } from "@/lib/constants";

/**
 * Куда ведёт пункт меню или кнопка: встроенная страница сайта, текстовая страница из админки
 * или любая ссылка. Адрес на сайте собирается в src/lib/links.ts.
 */
export const linkField = (overrides: Partial<GroupField> = {}): Field => ({
  name: "link",
  type: "group",
  label: "Куда ведёт",
  ...overrides,
  fields: [
    {
      name: "type",
      type: "radio",
      label: "Тип ссылки",
      defaultValue: "route",
      options: [
        { label: "Страница сайта", value: "route" },
        { label: "Текстовая страница из админки", value: "page" },
        { label: "Своя ссылка", value: "url" },
      ],
      admin: { layout: "horizontal" },
    },
    {
      name: "route",
      type: "select",
      label: "Страница сайта",
      options: SITE_ROUTES.map(({ value, label }) => ({ value, label })),
      admin: { condition: (_, sibling) => (sibling?.type ?? "route") === "route" },
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      label: "Текстовая страница",
      admin: { condition: (_, sibling) => sibling?.type === "page" },
    },
    {
      name: "url",
      type: "text",
      label: "Ссылка",
      admin: {
        condition: (_, sibling) => sibling?.type === "url",
        description: "Полная ссылка (https://…) или адрес на сайте, начиная с косой черты, например /calendar.",
      },
    },
  ],
});
