import Link from "next/link";
import { getSettings } from "@/lib/cms";
import { getSiteLayout } from "@/lib/layout";
import { telHref } from "@/lib/site";

export async function SiteFooter() {
  const [s, { logo, footerColumns }] = await Promise.all([getSettings(), getSiteLayout()]);
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="flagline" />
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logo ? <img src={logo.url} alt="" width={logo.width} height={logo.height} /> : null}
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
                  <li key={l.href + l.label}>
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
