import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";
import { renameUpload } from "@/hooks/upload";

export const Videos: CollectionConfig = {
  slug: "videos",
  labels: { singular: "Видео", plural: "Видео" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "published"],
    group: "Содержимое",
    description: "Загрузите видеофайл (MP4) или вставьте ссылку на видео в VK Видео, Rutube или YouTube.",
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeOperation: [renameUpload(4)],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    filesRequiredOnCreate: false,
  },
  fields: [
    { name: "title", type: "text", label: "Название", required: true },
    { name: "externalUrl", type: "text", label: "Ссылка на видео (если не загружаете файл)" },
    { name: "poster", type: "upload", relationTo: "media", label: "Обложка" },
    { name: "date", type: "date", label: "Дата съёмки", admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
    { name: "description", type: "textarea", label: "Описание" },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: false, admin: { position: "sidebar" } },
    { name: "inGallery", type: "checkbox", label: "Показывать в разделе «Медиа»", defaultValue: true, admin: { position: "sidebar", description: "Снимите, если видео нужно только для первого экрана главной." } },
  ],
};
