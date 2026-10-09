import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "Тренерам", slogan: SLOGANS.coaches };

export const generateMetadata = () => pageMetadata("coaches", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function CoachesPage() {
  return <PageView kind="coaches" banner="participants" fallback={fallback} />;
}
