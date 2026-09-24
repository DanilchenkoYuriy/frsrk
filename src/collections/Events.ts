import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { EVENT_DOC_KINDS, EVENT_LEVELS, EVENT_TYPES } from "@/lib/constants";
import { slugFrom } from "@/hooks/slug";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Мероприятие", plural: "Календарь мероприятий" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "dateFrom", "type", "level", "published"],
    group: "Содержимое",
    description: "Соревнования, семинары, сборы. Статус («Предстоит», «Завершено») считается по датам сам. Протоколы добавляйте в блок «Документы мероприятия».",
  },
  defaultSort: "-dateFrom",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Название мероприятия", required: true },
    {
      name: "slug",
      type: "text",
      label: "Адрес страницы (заполнится сам)",
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom("title")] },
      admin: { position: "sidebar" },
    },
    {
      type: "row",
      fields: [
        { name: "type", type: "select", label: "Тип", required: true, defaultValue: "competition", options: EVENT_TYPES.map(({ value, label }) => ({ value, label })), admin: { width: "50%" } },
        { name: "level", type: "select", label: "Уровень", required: true, defaultValue: "republic", options: EVENT_LEVELS.map(({ value, label }) => ({ value, label })), admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "dateFrom", type: "date", label: "Дата начала", required: true, index: true, admin: { width: "50%", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
        { name: "dateTo", type: "date", label: "Дата окончания (если несколько дней)", admin: { width: "50%", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
      ],
    },
    { name: "municipality", type: "relationship", relationTo: "municipalities", label: "Город или район" },
    { name: "venue", type: "text", label: "Площадка и адрес" },
    { name: "description", type: "richText", label: "Описание" },
    {
      type: "row",
      fields: [
        { name: "registrationUrl", type: "text", label: "Ссылка на регистрацию", admin: { width: "50%" } },
        { name: "registrationDeadline", type: "date", label: "Регистрация до", admin: { width: "50%", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
      ],
    },
    {
      name: "documents",
      type: "array",
      label: "Документы мероприятия (положение, протоколы, фотоотчёт)",
      fields: [
        { name: "kind", type: "select", label: "Что это", required: true, options: EVENT_DOC_KINDS.map(({ value, label }) => ({ value, label })) },
        { name: "document", type: "relationship", relationTo: "documents", label: "Файл из раздела «Документы»", required: true },
      ],
    },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
