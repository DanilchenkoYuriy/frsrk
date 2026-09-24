import Link from "next/link";
import { getSettings } from "@/lib/cms";
import { footerColumns } from "@/config/navigation";
import { telHref } from "@/lib/site";

export async function SiteFooter() {
  const s = await getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="flagline" />
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/frsrk-logo.png" alt="" width={577} height={433} />
              <div>
                <p className="footer__name">{s.fullName}</p>
                {s.legalName ? <p className="footer__legal">{s.legalName}</p> : null}
              </div>
            </div>
            <div className="footer__links" style={{ marginTop: 20 }}>
              {s.phone ? <a href={telHref(s.phone)}>{s.phone}</a> : null}
              {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : null}
              {s.address ? <span style={{ fontSize: "0.92rem", lineHeight: 1.5, paddingBlock: 6 }}>{s.address}</span> : null}
            </div>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="footer__heading">{col.title}</p>
              <ul className="footer__links">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer__bottom">
          <p>
            © {year} {s.legalName ?? s.fullName}. Все права защищены.
          </p>
          <p>
            <Link href="/legal/privacy">Политика обработки персональных данных</Link> · <Link href="/legal/cookies">Файлы cookie</Link>
          </p>
          <p>Разработан и создан Данильченко Ю. Л.</p>
        </div>
      </div>
    </footer>
  );
}
