import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";
import { renameUpload } from "@/hooks/upload";

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  // старые форматы Office (.xls, .doc, .ppt) определяются сервером как общий контейнер
  "application/x-cfb",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/zip",
  "text/plain",
];

export const Documents: CollectionConfig = {
  slug: "documents",
  labels: { singular: "Документ", plural: "Документы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "docDate", "status", "published"],
    group: "Содержимое",
    description: "Устав, приказы, положения, протоколы. Загрузите файл — он сохранится на сервере, а на сайте появится ссылка.",
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeOperation: [renameUpload(6)],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: DOCUMENT_MIME_TYPES,
  },
  fields: [
    { name: "title", type: "text", label: "Название документа", required: true },
    {
      name: "category",
      type: "select",
      label: "Раздел",
      required: true,
      defaultValue: "regulations",
      options: DOCUMENT_CATEGORIES.map(({ value, label }) => ({ value, label })),
    },
    {
      type: "row",
      fields: [
        { name: "number", type: "text", label: "Номер (если есть)", admin: { width: "50%" } },
        { name: "docDate", type: "date", label: "Дата документа", admin: { width: "50%", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
      ],
    },
    { name: "description", type: "textarea", label: "Краткое описание" },
    {
      name: "status",
      type: "select",
      label: "Актуальность",
      required: true,
      defaultValue: "current",
      options: [
        { label: "Действует", value: "current" },
        { label: "Утратил силу", value: "archived" },
      ],
    },
    { name: "order", type: "number", label: "Порядок в списке (меньше — выше)", defaultValue: 100 },
    {
      name: "published",
      type: "checkbox",
      label: "Показывать на сайте",
      defaultValue: false,
      admin: { position: "sidebar", description: "Включите, когда документ проверен. Документы со списками детей публикуйте только при согласии родителей." },
    },
  ],
};
