import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource/bad-script/cyrillic-400.css";
import "@fontsource/bad-script/latin-400.css";
import "./globals.css";
import { getSettings, populated, type Media } from "@/lib/cms";
import { SITE_URL } from "@/lib/site";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CookieNotice } from "@/components/layout/CookieNotice";

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
      images: og?.url ? [{ url: og.url, width: og.width ?? 1200, height: og.height ?? 630 }] : undefined,
    },
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
  const s = await getSettings();
  return (
    <html lang="ru">
      <body>
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
