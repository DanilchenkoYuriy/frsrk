import type { Field, GroupField } from "payload";
import { SITE_ROUTES } from "@/lib/constants";

/**
 * Куда ведёт ссылка или кнопка: страница сайта из «Страницы сайта», встроенный адрес
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
      defaultValue: "page",
      options: [
        { label: "Страница сайта", value: "page" },
        { label: "Встроенный адрес", value: "route" },
        { label: "Своя ссылка", value: "url" },
      ],
      admin: { layout: "horizontal" },
    },
    {
      name: "route",
      type: "select",
      label: "Встроенный адрес",
      options: SITE_ROUTES.map(({ value, label }) => ({ value, label })),
      admin: { condition: (_, sibling) => sibling?.type === "route" },
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      label: "Страница сайта",
      admin: { condition: (_, sibling) => (sibling?.type ?? "page") === "page" },
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
