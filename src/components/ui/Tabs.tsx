"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** Вкладки для длинных страниц: заголовки сверху, показывается один раздел. Все разделы есть в коде страницы для поисковиков. */
export function Tabs({ tabs, label, sticky = false }: { tabs: TabItem[]; label: string; sticky?: boolean }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  return (
    <div className="tabs">
      <div className={`tabs__list${sticky ? " tabs__list--sticky" : ""}`} role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className="tabs__tab"
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => move(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`${uid}-panel-${t.id}`} aria-labelledby={`${uid}-tab-${t.id}`} className="tabs__panel" hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
