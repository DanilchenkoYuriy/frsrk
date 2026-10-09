import type { UIFieldServerProps } from "payload";

/** Пояснение внутри блока в админке, без поля ввода. Текст задаётся в admin.custom.text у поля. */
export function BlockNote({ field }: UIFieldServerProps) {
  const text = (field.admin?.custom as { text?: string } | undefined)?.text;
  return text ? <p style={{ margin: "4px 0 12px", color: "var(--theme-elevation-600)", lineHeight: 1.5 }}>{text}</p> : null;
}
