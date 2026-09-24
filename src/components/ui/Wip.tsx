import type { ReactNode } from "react";

/** Пустой раздел: честно сообщаем, что текст ещё пишется. */
export function Wip({ title = "Раздел в разработке", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="wip">
      <p className="wip__title">{title}</p>
      <p className="wip__text">{children ?? "Текст этого раздела готовится и появится здесь позже. Если нужна информация срочно, напишите нам на странице «Контакты»."}</p>
    </div>
  );
}

export function Empty({ children }: { children: string }) {
  return <p className="empty">{children}</p>;
}
