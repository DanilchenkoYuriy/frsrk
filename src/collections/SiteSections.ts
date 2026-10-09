import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, publishedOrStaff } from "@/access";
import { RESERVED_SLUGS } from "@/lib/constants";
import { slugify } from "@/lib/translit";
import { linkField } from "@/fields/link";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";

export const SiteSections: CollectionConfig = {
  slug: "site-sections",
  labels: { singular: "Раздел с боковым меню", plural: "Разделы с боковым меню" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "published", "updatedAt"],
    group: "Структура сайта",
    description:
      "Разделы, где слева список пунктов, а справа содержимое: «О федерации», «Участникам» и новые. Чтобы добавить страницу в раздел, создайте её в «Текстовые страницы», выберите там раздел, а здесь добавьте пункт слева.",
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: "title", type: "text", label: "Название раздела", required: true },
    {
      name: "slug",
      type: "text",
      label: "Адрес раздела (латиницей)",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Раздел откроется по адресу frsrk.ru/адрес. Для «О федерации» это about, для «Участникам» participants: их не меняйте.",
      },
      hooks: { beforeValidate: [({ value, data }) => slugify(String(value || data?.title || ""))] },
      validate: (value: string | null | undefined) => {
        if (!value) return "Укажите адрес";
        if ((RESERVED_SLUGS as readonly string[]).includes(value)) return `Адрес «${value}» уже занят другой страницей сайта`;
        return true;
      },
    },
    {
      name: "items",
      type: "array",
      label: "Пункты слева",
      labels: { singular: "Пункт", plural: "Пункты" },
      admin: { description: "Первый видимый пункт открывается, когда посетитель заходит в раздел.", components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
      fields: [
        { name: "label", type: "text", label: "Название", required: true },
        linkField(),
        { name: "hidden", type: "checkbox", label: "Скрыть на сайте", defaultValue: false },
      ],
    },
    { name: "banner", type: "upload", relationTo: "media", label: "Картинка на полосе заголовка", admin: { description: "Если пусто, берётся картинка из «Данные федерации → Полосы заголовков»." } },
    { name: "slogan", type: "text", label: "Рукописная надпись на полосе заголовка" },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
