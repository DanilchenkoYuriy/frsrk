import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { slugFrom } from "@/hooks/slug";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "Новость", plural: "Новости" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "featured", "published"],
    group: "Содержимое",
    description: "Новости федерации. Чтобы новость появилась на сайте, включите «Показывать на сайте».",
  },
  defaultSort: "-publishedAt",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Заголовок", required: true },
    {
      name: "slug",
      type: "text",
      label: "Адрес страницы (заполнится сам)",
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom("title")] },
      admin: { position: "sidebar" },
    },
    { name: "publishedAt", type: "date", label: "Дата публикации", required: true, defaultValue: () => new Date().toISOString(), admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
    { name: "excerpt", type: "textarea", label: "Короткое описание (1–2 предложения)", required: true, maxLength: 300 },
    { name: "cover", type: "upload", relationTo: "media", label: "Обложка" },
    { name: "body", type: "richText", label: "Текст новости" },
    {
      name: "gallery",
      type: "array",
      label: "Фотографии к новости",
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    { name: "event", type: "relationship", relationTo: "events", label: "Связанное мероприятие" },
    { name: "featured", type: "checkbox", label: "Показать на главной", defaultValue: false, admin: { position: "sidebar" } },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
