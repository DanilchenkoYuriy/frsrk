import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { slugFrom } from "@/hooks/slug";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const Galleries: CollectionConfig = {
  slug: "galleries",
  labels: { singular: "Фотоальбом", plural: "Фотоальбомы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "published"],
    group: "Содержимое",
    description: "Фотографии с соревнований и мероприятий. Фото детей публикуйте только с согласия родителей.",
  },
  defaultSort: "-date",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Название альбома", required: true },
    {
      name: "slug",
      type: "text",
      label: "Адрес страницы (заполнится сам)",
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom("title")] },
      admin: { position: "sidebar" },
    },
    { name: "date", type: "date", label: "Дата", required: true, defaultValue: () => new Date().toISOString(), admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
    { name: "description", type: "textarea", label: "Описание" },
    { name: "cover", type: "upload", relationTo: "media", label: "Обложка альбома" },
    { name: "event", type: "relationship", relationTo: "events", label: "Мероприятие" },
    {
      name: "photos",
      type: "array",
      label: "Фотографии",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", label: "Подпись" },
      ],
    },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
