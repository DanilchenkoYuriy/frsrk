"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import { TelegramIcon, VkIcon } from "@/components/ui/Icons";

interface Props {
  items: readonly NavItem[];
  cta: { label: string; href: string };
  vk?: string | null;
  telegram?: string | null;
}

const matches = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** Подсвечивается один пункт: самый точный. На /participants/antidoping это «Антидопинг», а не «Участникам». */
const currentHref = (pathname: string, items: readonly NavItem[]) =>
  items.filter((i) => matches(pathname, i.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;

export function SiteNav({ items, cta, vk, telegram }: Props) {
  const pathname = usePathname();
  // Меню открыто только на той странице, где его открыли: при переходе оно закрывается само.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const current = currentHref(pathname, items);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav className="topnav" aria-label="Основная навигация">
      <div className="container topnav__inner">
        <span className="topnav__brand-mobile">ФРСРК</span>
        <ul className="topnav__list">
          {items.map((item) => (
            <li className="topnav__item" key={item.href}>
              <Link
                href={item.href}
                className={`topnav__link${item.children ? " topnav__link--parent" : ""}`}
                aria-current={current === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
              {item.children ? (
                <div className="topnav__sub">
                  {item.children.map((child) => (
                    <Link key={child.href + child.label} href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        <Link href={cta.href} className="btn btn--red btn--sm topnav__cta">
          {cta.label}
        </Link>
        <button type="button" className="burger" aria-label="Меню" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpenedOn(open ? null : pathname)}>
          <span className="burger__icon" aria-hidden="true" />
        </button>
      </div>

      <div className="mobile-menu" id="mobile-menu" hidden={!open} role="dialog" aria-modal="true" aria-label="Меню сайта">
        <div className="mobile-menu__top">
          <span className="topnav__brand-mobile">ФРСРК</span>
          <button type="button" className="mobile-menu__close" ref={closeRef} onClick={() => setOpenedOn(null)}>
            Закрыть
          </button>
        </div>
        <Link href={cta.href} aria-current={matches(pathname, cta.href) ? "page" : undefined}>
          {cta.label}
        </Link>
        {items.map((item) => (
          <div key={item.href}>
            <Link href={item.href} aria-current={current === item.href ? "page" : undefined}>
              {item.label}
            </Link>
            {item.children ? (
              <div className="mobile-menu__sub">
                {item.children
                  .filter((c) => c.href !== item.href)
                  .map((child) => (
                    <Link key={child.href + child.label} href={child.href} aria-current={pathname === child.href ? "page" : undefined}>
                      {child.label}
                    </Link>
                  ))}
              </div>
            ) : null}
          </div>
        ))}
        <div className="mobile-menu__social">
          {vk ? (
            <a className="icon-btn" href={vk} target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте">
              <VkIcon />
            </a>
          ) : null}
          {telegram ? (
            <a className="icon-btn" href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <TelegramIcon />
            </a>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
