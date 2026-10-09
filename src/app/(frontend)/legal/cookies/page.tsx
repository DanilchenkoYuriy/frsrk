import { PageView, pageMetadata } from "@/components/page/PageView";

const fallback = { title: "Файлы cookie" };

export const generateMetadata = () => pageMetadata("cookies", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function CookiesPage() {
  return <PageView kind="cookies" fallback={fallback} />;
}
