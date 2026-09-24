import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, publishedOrStaff } from "@/access";
import { PAGE_KEYS } from "@/lib/constants";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Текстовая страница", plural: "Текстовые страницы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "key", "updatedAt", "published"],
    group: "Содержимое",
    description: "Тексты разделов: «О федерации», «Родителям», «Антидопинг», политика персональных данных. Пока текст пустой, на сайте написано, что раздел в разработке.",
  },
  access: { read: publishedOrStaff, create: isAdmin, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Заголовок страницы", required: true },
    { name: "key", type: "select", label: "Какой раздел сайта", required: true, unique: true, index: true, options: PAGE_KEYS.map(({ value, label }) => ({ value, label })), admin: { position: "sidebar" } },
    { name: "lead", type: "textarea", label: "Вводный абзац (1–2 предложения)" },
    { name: "body", type: "richText", label: "Текст страницы" },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
