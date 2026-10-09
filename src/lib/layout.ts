import "server-only";
import { cache } from "react";
import { getLayout, getPagesIndex, populated, type Media } from "@/lib/cms";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { linkHref, visibleLinks } from "@/lib/links";
import { buildTree } from "@/lib/tree";
import type { SocialLink } from "@/components/ui/Icons";
import type { NavItem } from "@/config/navigation";

const DEFAULT_LOGO = { url: "/brand/frsrk-logo.png", width: 577, height: 433 };

/** Дерево страниц сайта: один раз на запрос. */
export const getSiteTree = cache(async () => buildTree(await getPagesIndex()));

/** Шапка, меню и подвал в виде, готовом для вывода: скрытые пункты убраны, адреса собраны. */
export async function getSiteLayout() {
  const [l, tree] = await Promise.all([getLayout(), getSiteTree()]);
  const media = populated<Media>(l.logo);
  const logo = l.showLogo === false ? null : media?.url ? { url: media.url, width: media.width ?? 400, height: media.height ?? 300 } : DEFAULT_LOGO;

  const menu: NavItem[] = tree.topMenu();
  const ctaHref = l.cta?.show === false ? null : linkHref(l.cta?.link, tree);

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
    .map((c) => ({ title: c.title, links: visibleLinks(c.links, tree).map(({ label, href }) => ({ label, href })) }))
    .filter((c) => c.links.length);

  return {
    logo,
    showName: l.showName !== false,
    slogan: l.slogan?.trim() || null,
    menu,
    cta: ctaHref ? { label: l.cta?.label || "Найти секцию", href: ctaHref } : null,
    socials,
    footerColumns,
  };
}
