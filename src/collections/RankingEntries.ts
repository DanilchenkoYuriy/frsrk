import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { AGE_GROUPS, DISCIPLINES, GENDERS } from "@/lib/constants";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const RankingEntries: CollectionConfig = {
  slug: "ranking-entries",
  labels: { singular: "Строка рейтинга", plural: "Рейтинг спортсменов" },
  admin: {
    useAsTitle: "athlete",
    defaultColumns: ["athlete", "season", "discipline", "ageGroup", "points", "published"],
    group: "Содержимое",
    description:
      "Каждая строка это один спортсмен в одной дисциплине и возрастной группе за сезон. Места на сайте считаются сами по очкам. Публикуйте данные спортсменов, в том числе детей, только с согласия родителей.",
  },
  defaultSort: "-points",
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "athlete", type: "text", label: "Фамилия и имя спортсмена", required: true },
    {
      type: "row",
      fields: [
        { name: "season", type: "text", label: "Сезон (например, 2026)", required: true, index: true, admin: { width: "33%" } },
        { name: "discipline", type: "select", label: "Дисциплина", required: true, options: DISCIPLINES.map(({ value, label }) => ({ value, label })), admin: { width: "67%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "ageGroup", type: "select", label: "Возрастная группа", required: true, options: AGE_GROUPS.map(({ value, label }) => ({ value, label })), admin: { width: "50%" } },
        { name: "gender", type: "select", label: "Пол", required: true, options: GENDERS.map(({ value, label }) => ({ value, label })), admin: { width: "50%" } },
      ],
    },
    { name: "municipality", type: "relationship", relationTo: "municipalities", label: "Муниципальное образование" },
    { name: "club", type: "text", label: "Клуб или организация" },
    {
      type: "row",
      fields: [
        { name: "points", type: "number", label: "Очки", required: true, min: 0, admin: { width: "50%" } },
        { name: "starts", type: "number", label: "Число стартов", min: 0, admin: { width: "50%" } },
      ],
    },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
