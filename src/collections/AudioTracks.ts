import type { CollectionConfig } from "payload";
import { isStaff, publishedOrStaff } from "@/access";
import { revalidateAfterChange, revalidateAfterDelete } from "@/hooks/revalidate";
import { renameUpload } from "@/hooks/upload";

export const AudioTracks: CollectionConfig = {
  slug: "audio-tracks",
  labels: { singular: "Музыкальная дорожка", plural: "Музыка для соревнований" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "published"],
    group: "Содержимое",
    description: "Официальные звуковые дорожки для дисциплин. Формат MP3, файлы хранятся на сервере.",
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeOperation: [renameUpload(4)],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac"],
  },
  fields: [
    { name: "title", type: "text", label: "Название дорожки", required: true },
    { name: "durationLabel", type: "text", label: "Длительность (например, 1:30)" },
    { name: "order", type: "number", label: "Порядок в списке", defaultValue: 100 },
    { name: "published", type: "checkbox", label: "Показывать на сайте", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
