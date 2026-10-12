import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource/bad-script/cyrillic-400.css";
import "@fontsource/bad-script/latin-400.css";
import "./globals.css";
import { getSettings, populated, type Media } from "@/lib/cms";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getSiteLayout } from "@/lib/layout";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { JsonLd } from "@/components/ui/JsonLd";

// Данные берутся из базы при запросе (и кешируются), поэтому сборка не требует подключения к базе.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const og = populated<Media>(s.ogImage);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.shortName} — ${s.fullName}`, template: `%s — ${s.shortName}` },
    description: s.description ?? undefined,
    applicationName: s.shortName,
    icons: { icon: "/brand/favicon.png", apple: "/brand/apple-touch-icon.png" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: s.fullName,
      title: s.fullName,
      description: s.description ?? undefined,
      // Если картинку не загрузили в админке, берётся оформленная заставка с гербом из public/brand
      images: og?.url ? [{ url: og.url, width: og.width ?? 1200, height: og.height ?? 630 }] : [{ url: "/brand/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "./" },
    verification: env.YANDEX_VERIFICATION ? { yandex: env.YANDEX_VERIFICATION } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  width: "device-width",
  initialScale: 1,
};

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [s, { logo, socials }] = await Promise.all([getSettings(), getSiteLayout()]);
  const organization = {
    "@type": "SportsOrganization",
    "@id": absoluteUrl("/#organization"),
    name: s.fullName,
    alternateName: s.shortName,
    legalName: s.legalName ?? undefined,
    sport: "Роуп скиппинг (спортивная скакалка)",
    url: absoluteUrl("/"),
    logo: logo ? new URL(logo.url, SITE_URL).href : undefined,
    email: s.email ?? undefined,
    telephone: s.phone ?? undefined,
    address: s.address ? { "@type": "PostalAddress", streetAddress: s.address, addressRegion: "Республика Крым", addressCountry: "RU" } : undefined,
    areaServed: "Республика Крым",
    sameAs: socials.length ? socials.map((x) => x.url) : undefined,
  };
  return (
    <html lang="ru">
      <body>
        <JsonLd data={{ "@graph": [organization, { "@type": "WebSite", url: absoluteUrl("/"), name: s.fullName, alternateName: s.shortName, inLanguage: "ru", publisher: { "@id": absoluteUrl("/#organization") } }] }} />
        <a className="skip-link" href="#content">
          Перейти к содержанию
        </a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
        <CookieNotice metrikaId={s.metrikaId} />
      </body>
    </html>
  );
}
