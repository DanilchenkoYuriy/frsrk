import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "@/access";
import { MUNICIPALITY_KINDS } from "@/lib/constants";
import { slugFrom } from "@/hooks/slug";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const Municipalities: CollectionConfig = {
  slug: "municipalities",
  labels: { singular: "Муниципальное образование", plural: "Муниципальные образования" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kind"],
    group: "Содержимое",
    description: "25 муниципальных образований Республики Крым и Севастополь (город федерального значения, не входит в Республику Крым). Обычно менять их не нужно.",
  },
  defaultSort: "name",
  access: { read: () => true, create: isAdmin, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "name", type: "text", label: "Название", required: true },
    {
      name: "slug",
      type: "text",
      label: "Код на карте (заполнится сам)",
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom("name")] },
      admin: { position: "sidebar", description: "Совпадает с кодом территории на карте Крыма. Не меняйте без необходимости." },
    },
    { name: "kind", type: "select", label: "Тип", required: true, options: MUNICIPALITY_KINDS.map(({ value, label }) => ({ value, label })) },
    { name: "representative", type: "relationship", relationTo: "people", label: "Представитель федерации" },
  ],
};
