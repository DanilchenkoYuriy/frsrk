import type { CollectionConfig } from "payload";
import { isStaff, nobody } from "@/access";
import { INQUIRY_TOPICS } from "@/lib/constants";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: { singular: "Обращение", plural: "Обращения с сайта" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "topic", "status", "createdAt"],
    group: "Система",
    description: "Сообщения, которые посетители отправили через форму на странице «Контакты». Содержат персональные данные: не выгружайте и не пересылайте их без необходимости.",
  },
  defaultSort: "-createdAt",
  // Создаются только серверным обработчиком формы (/api/inquiries); через открытый REST создать нельзя.
  access: { read: isStaff, create: nobody, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", label: "Имя", required: true },
    { name: "topic", type: "select", label: "Тема", required: true, options: INQUIRY_TOPICS.map(({ value, label }) => ({ value, label })) },
    { name: "email", type: "email", label: "Почта" },
    { name: "phone", type: "text", label: "Телефон" },
    { name: "message", type: "textarea", label: "Сообщение", required: true },
    { name: "consent", type: "checkbox", label: "Согласие на обработку персональных данных", required: true },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "new",
      options: [
        { label: "Новое", value: "new" },
        { label: "Обработано", value: "done" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
