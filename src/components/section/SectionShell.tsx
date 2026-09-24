import Link from "next/link";
import type { ReactNode } from "react";

export interface ShellItem {
  label: string;
  href: string;
  count?: number;
  /** Отметка справа, например «текст» */
  tag?: string;
  active?: boolean;
}

interface Props {
  title: string;
  items: readonly ShellItem[];
  /** Блок под списком: поиск, подсказка */
  top?: ReactNode;
  children: ReactNode;
}

/** Общий шаблон разделов: слева пункты, справа содержимое. На телефоне пункты идут строкой сверху. */
export function SectionShell({ title, items, top, children }: Props) {
  return (
    <div className="shell">
      <aside className="shell__side">
        {top}
        <nav aria-label={title}>
          <ul className="shell__list">
            {items.map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="shell__link" aria-current={item.active ? "page" : undefined}>
                  <span className="shell__label">{item.label}</span>
                  {item.count !== undefined ? <span className="shell__count">{item.count}</span> : null}
                  {item.tag ? <span className="shell__tag">{item.tag}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="shell__main">{children}</div>
    </div>
  );
}
