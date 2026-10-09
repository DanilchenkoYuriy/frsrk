import { PageView, pageMetadata } from "@/components/page/PageView";

const fallback = { title: "Политика обработки персональных данных" };

export const generateMetadata = () => pageMetadata("privacy", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function PrivacyPage() {
  return <PageView kind="privacy" fallback={fallback} />;
}
