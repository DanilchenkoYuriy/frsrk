import Link from "next/link";
import type { ReactNode } from "react";
import { getSettings, populated, type Media } from "@/lib/cms";
import { Picture } from "@/components/ui/Picture";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  lead?: string | null;
  crumbs?: Crumb[];
  /** Рукописная надпись справа (только на компьютере) */
  slogan?: string;
  children?: ReactNode;
}

/** Заголовок внутренней страницы: тёмная полоса с фото главной страницы. */
export async function PageHead({ title, lead, crumbs = [], slogan, children }: Props) {
  const settings = await getSettings();
  const hero = populated<Media>(settings.heroImage);
  return (
    <header className="banner">
      {hero ? (
        <div className="banner__media" aria-hidden="true">
          <Picture media={hero} alt="" sizes="100vw" priority />
        </div>
      ) : null}
      <div className="container banner__inner">
        <nav aria-label="Хлебные крошки">
          <ol className="crumbs">
            <li>
              <Link href="/">Главная</Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}</li>
            ))}
          </ol>
        </nav>
        <h1 className="banner__title">{title}</h1>
        {lead ? <p className="banner__lead">{lead}</p> : null}
        {children}
        {slogan ? (
          <p className="banner__slogan" aria-hidden="true">
            {slogan}
          </p>
        ) : null}
      </div>
    </header>
  );
}
