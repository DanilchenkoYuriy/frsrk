import type { CollectionConfig } from "payload";
import { isStaff } from "@/access";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";
import { renameUpload } from "@/hooks/upload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Изображение", plural: "Изображения" },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "createdAt"],
    group: "Файлы",
    description: "Фотографии и картинки. Файлы хранятся на сервере (S3), а не внутри сайта.",
  },
  access: { read: () => true, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeOperation: [renameUpload(4)],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre", formatOptions: { format: "webp", options: { quality: 78 } } },
      { name: "card", width: 800, height: undefined, formatOptions: { format: "webp", options: { quality: 78 } } },
      { name: "wide", width: 1600, height: undefined, formatOptions: { format: "webp", options: { quality: 76 } } },
    ],
  },
  fields: [
    { name: "alt", type: "text", label: "Описание картинки (для незрячих и поисковиков)", required: true },
    { name: "caption", type: "text", label: "Подпись под фото" },
    { name: "credit", type: "text", label: "Автор фото" },
  ],
};
