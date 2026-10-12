import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Адрес сайта берётся из настроек сервера при запросе, а не при сборке: иначе в robots.txt попадает localhost.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
