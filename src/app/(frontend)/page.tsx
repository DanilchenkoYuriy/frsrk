import type { Metadata } from "next";
import { getPage } from "@/lib/cms";
import { PageView } from "@/components/page/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return {
    ...(page?.metaTitle ? { title: { absolute: page.metaTitle } } : {}),
    ...(page?.metaDescription ? { description: page.metaDescription } : {}),
  };
}

/** Главная собирается из блоков в «Страницы сайта → Главная». */
export default function HomePage() {
  return <PageView kind="home" fallback={{ title: "Главная" }} />;
}
