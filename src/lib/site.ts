import { env } from "@/lib/env";

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Телефон в виде ссылки: +7 978 738-32-46 → tel:+79787383246 */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const FEDERATION_SHORT = "ФРСРК";
