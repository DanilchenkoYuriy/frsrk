import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { PEOPLE_GROUPS } from "@/lib/constants";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const People: CollectionConfig = {
  slug: "people",
  labels: { singular: "Человек", plural: "Люди (руководство, тренеры, судьи)" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "position", "group", "published"],
    group: "Содержимое",
    description: "Публикуйте данные людей только с их согласия. Фото детей — только с согласием родителей.",
  },
  defaultSort: "order",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "name", type: "text", label: "ФИО", required: true },
    { name: "position", type: "text", label: "Должность или роль", required: true },
    { name: "group", type: "select", label: "Группа", required: true, defaultValue: "leadership", options: PEOPLE_GROUPS.map(({ value, label }) => ({ value, label })) },
    { name: "photo", type: "upload", relationTo: "media", label: "Фото" },
    { name: "bio", type: "textarea", label: "Коротко о человеке" },
    {
      type: "row",
      fields: [
        { name: "phone", type: "text", label: "Телефон", admin: { width: "50%" } },
        { name: "email", type: "email", label: "Почта", admin: { width: "50%" } },
      ],
    },
    { name: "order", type: "number", label: "Порядок (меньше — выше)", defaultValue: 100 },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
