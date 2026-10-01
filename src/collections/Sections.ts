import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { DISCIPLINES } from "@/lib/constants";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const Sections: CollectionConfig = {
  slug: "sections",
  labels: { singular: "Секция", plural: "Секции (где заниматься)" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "municipality", "coach", "published"],
    group: "Содержимое",
    description: "Места, где можно заниматься роуп скиппингом. Показываются на карте и в разделе «Найти секцию».",
  },
  defaultSort: "title",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Название секции или клуба", required: true },
    { name: "municipality", type: "relationship", relationTo: "municipalities", label: "Муниципальное образование", required: true },
    { name: "organization", type: "text", label: "Организация (школа, центр, клуб)" },
    { name: "locality", type: "text", label: "Город, село или посёлок", admin: { description: "Например: село Раздольное. Выводится перед улицей." } },
    { name: "address", type: "text", label: "Улица и дом", required: true, admin: { description: "Например: ул. Школьная, 22. Город или село впишите в поле выше." } },
    { name: "coach", type: "text", label: "Тренер (ФИО)" },
    {
      type: "row",
      fields: [
        { name: "ageFrom", type: "number", label: "Возраст от", min: 3, max: 99, admin: { width: "50%" } },
        { name: "ageTo", type: "number", label: "Возраст до", min: 3, max: 99, admin: { width: "50%" } },
      ],
    },
    { name: "schedule", type: "textarea", label: "Дни и время занятий" },
    {
      type: "row",
      fields: [
        { name: "isFree", type: "checkbox", label: "Занятия бесплатные", defaultValue: false, admin: { width: "50%" } },
        { name: "priceNote", type: "text", label: "Стоимость (если платно)", admin: { width: "50%" } },
      ],
    },
    { name: "disciplines", type: "select", hasMany: true, label: "Дисциплины", options: DISCIPLINES.map(({ value, label }) => ({ value, label })) },
    {
      type: "row",
      fields: [
        { name: "phone", type: "text", label: "Телефон для записи", admin: { width: "50%" } },
        { name: "messengerUrl", type: "text", label: "Ссылка на мессенджер или группу", admin: { width: "50%" } },
      ],
    },
    { name: "description", type: "textarea", label: "О секции" },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
