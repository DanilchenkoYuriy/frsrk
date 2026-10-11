import type { ReactElement } from "react";

export const VkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.6 17.2c-6 0-9.4-4.1-9.6-10.9h3c.1 5 2.3 7.1 4.1 7.6V6.3h2.8v4.3c1.7-.2 3.5-2.1 4.1-4.3h2.8c-.4 2.7-2.4 4.6-3.8 5.4 1.4.7 3.5 2.3 4.4 5.5h-3.1c-.7-2-2.3-3.6-4.4-3.8v3.8h-.3z" />
  </svg>
);

export const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21.4 3.5 2.7 10.7c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.8-.8L22.7 5c.3-1.2-.5-1.8-1.3-1.5zM9.3 13.2l9-5.7c.4-.3.8-.1.5.2l-7.4 6.7-.3 3-1.5-4.9z" />
  </svg>
);

// Знак мессенджера Max, взят с max.ru
export const MaxIcon = () => (
  <svg viewBox="-10 -10 120 122" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M50.76 0c27.53 0 49.12 22.34 49.12 49.89S77.61 99.23 51.02 99.23c-9.43 0-14.01-1.33-21.37-6.54-.5-.36-1.2-.26-1.63.19-5.66 6.04-20.17 10.28-20.83 2.03C7.19 80.53 0 71.18 0 49.61 0 21.3 23.22 0 50.76 0m.77 24.55c-13.07-.68-23.26 8.39-25.51 22.58-1.86 11.75 1.44 26.07 4.26 26.8 1.2.3 4.08-1.9 6.18-3.88.4-.37.99-.44 1.45-.15 3.27 2 6.97 3.5 11.05 3.71 13.42.7 25.3-9.8 26-23.21.71-13.42-10.01-25.14-23.43-25.85"
    />
  </svg>
);

const stroke = (d: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const ICONS: Record<string, ReactElement> = {
  scroll: stroke("M8 3h9a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1h3M8 3v14a3 3 0 0 1-3 3M11 8h5M11 12h5"),
  book: stroke("M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 0 2 2h13"),
  medal: stroke("M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 13.5 7 21l5-3 5 3-1.5-7.5"),
  music: stroke("M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"),
  cap: stroke("M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"),
  shield: stroke("M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4"),
  pin: stroke("M12 21s7-6.4 7-11.5a7 7 0 1 0-14 0c0 5.1 7 11.5 7 11.5zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"),
  flag: stroke("M6 21V4M6 4h12l-3 4 3 4H6"),
  calendar: stroke("M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM3 9h18M8 2v4M16 2v4"),
};

export const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: "none" }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);

/** Соцсеть из админки, уже с готовым адресом иконки. */
export interface SocialLink {
  network: string;
  label: string;
  url: string;
  iconUrl?: string | null;
}

/** Значок соцсети: встроенный или загруженный в админке. */
export function SocialIcon({ network, iconUrl }: Pick<SocialLink, "network" | "iconUrl">) {
  if (network === "vk") return <VkIcon />;
  if (network === "telegram") return <TelegramIcon />;
  if (network === "max") return <MaxIcon />;
  if (network === "youtube") return <YoutubeIcon />;
  // eslint-disable-next-line @next/next/no-img-element
  if (iconUrl) return <img src={iconUrl} alt="" width={22} height={22} />;
  return <LinkIcon />;
}
