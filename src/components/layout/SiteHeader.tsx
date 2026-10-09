import Link from "next/link";
import { getSettings } from "@/lib/cms";
import { getSiteLayout } from "@/lib/layout";
import { SiteNav } from "@/components/layout/SiteNav";
import { SocialIcon } from "@/components/ui/Icons";

export async function SiteHeader() {
  const [s, layout] = await Promise.all([getSettings(), getSiteLayout()]);
  // Название в две строки: «Федерация роуп скиппинга (спортивной скакалки)» и «Республики Крым»
  const tail = "Республики Крым";
  const split = s.fullName.endsWith(tail);
  const first = split ? s.fullName.slice(0, -tail.length).trim() : s.fullName;
  const second = split ? tail : "";
  return (
    <>
      <header className="brandbar">
        <div className="container brandbar__inner">
          <Link href="/" className="brand" aria-label={`${s.fullName}: на главную`}>
            {layout.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="brand__logo" src={layout.logo.url} alt={`Герб ${s.shortName}`} width={layout.logo.width} height={layout.logo.height} />
            ) : null}
            {layout.showName ? (
              <span className="brand__name">
                <span className="brand__short">{s.shortName}</span>
                <span className="brand__line">{first}</span>
                {second ? <span className="brand__line">{second}</span> : null}
              </span>
            ) : null}
          </Link>
          <div className="brandbar__tools">
            {layout.slogan ? (
              <p className="brandbar__slogan" aria-hidden="true">
                {layout.slogan}
              </p>
            ) : null}
            {layout.socials.map((social) => (
              <a key={social.url} className="icon-btn" href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                <SocialIcon network={social.network} iconUrl={social.iconUrl} />
              </a>
            ))}
          </div>
        </div>
      </header>
      <SiteNav items={layout.menu} cta={layout.cta} socials={layout.socials} shortName={s.shortName} />
    </>
  );
}
