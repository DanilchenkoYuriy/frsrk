import { randomBytes } from "node:crypto";
import type { CollectionBeforeOperationHook } from "payload";
import { safeFilename } from "@/lib/translit";

/**
 * Переименовывает загружаемый файл в латиницу и добавляет случайный хвост.
 * Так в адресе нет русских букв, а закрытые файлы нельзя угадать.
 */
export const renameUpload =
  (tailBytes = 6): CollectionBeforeOperationHook =>
  ({ args, operation }) => {
    if (operation !== "create" && operation !== "update") return args;
    const file = args.req?.file;
    if (file?.name) file.name = safeFilename(file.name, randomBytes(tailBytes).toString("hex"));
    return args;
  };
