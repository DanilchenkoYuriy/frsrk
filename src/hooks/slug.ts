import type { FieldHook } from "payload";
import { slugify } from "@/lib/translit";

/** Если адрес не заполнен — строим его из названия. Исправляет русские буквы и пробелы. */
export const slugFrom =
  (sourceField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    const manual = typeof value === "string" ? value.trim() : "";
    if (manual) return slugify(manual);
    const source = (data?.[sourceField] ?? originalDoc?.[sourceField]) as string | undefined;
    return source ? slugify(source) : value;
  };
