const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Русский текст → латинский slug для адресов и имён файлов. */
export function slugify(input: string, maxLength = 80): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((ch) => MAP[ch] ?? ch)
    .join("");
  return latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** Безопасное имя файла: латиница + случайный хвост, чтобы закрытые файлы нельзя было угадать. */
export function safeFilename(original: string, randomTail: string): string {
  const dot = original.lastIndexOf(".");
  const base = dot > 0 ? original.slice(0, dot) : original;
  const ext = dot > 0 ? original.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const slug = slugify(base, 60) || "file";
  return ext ? `${slug}-${randomTail}.${ext}` : `${slug}-${randomTail}`;
}
