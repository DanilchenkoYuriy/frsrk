import "server-only";
import { getLayout, populated, type Media } from "@/lib/cms";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { visibleLinks } from "@/lib/links";
import type { SocialLink } from "@/components/ui/Icons";
import type { NavItem } from "@/config/navigation";

const DEFAULT_LOGO = { url: "/brand/frsrk-logo.png", width: 577, height: 433 };

/** Шапка, меню и подвал из админки в виде, готовом для вывода: скрытые пункты убраны, адреса собраны. */
export async function getSiteLayout() {
  const l = await getLayout();
  const media = populated<Media>(l.logo);
  const logo = l.showLogo === false ? null : media?.url ? { url: media.url, width: media.width ?? 400, height: media.height ?? 300 } : DEFAULT_LOGO;

  const menu: NavItem[] = visibleLinks(l.menu).map((item) => {
    const children = visibleLinks(item.children).map(({ label, href }) => ({ label, href }));
    return { label: item.label, href: item.href, ...(children.length ? { children } : {}) };
  });

  const [cta] = l.cta?.show === false ? [] : visibleLinks([{ label: l.cta?.label || "Найти секцию", link: l.cta?.link }]);

  const socials: SocialLink[] = (l.socials ?? [])
    .filter((s) => !s.hidden && s.url?.trim())
    .map((s) => ({
      network: s.network,
      label: s.label || SOCIAL_NETWORKS.find((n) => n.value === s.network)?.label || "Соцсеть",
      url: s.url.trim(),
      iconUrl: populated<Media>(s.icon)?.url ?? null,
    }));

  const footerColumns = (l.footerColumns ?? [])
    .filter((c) => !c.hidden)
    .map((c) => ({ title: c.title, links: visibleLinks(c.links).map(({ label, href }) => ({ label, href })) }))
    .filter((c) => c.links.length);

  return {
    logo,
    showName: l.showName !== false,
    slogan: l.slogan?.trim() || null,
    menu,
    cta: cta ? { label: cta.label, href: cta.href } : null,
    socials,
    footerColumns,
  };
}
