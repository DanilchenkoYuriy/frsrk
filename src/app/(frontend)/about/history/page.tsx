import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "История", slogan: SLOGANS.history };

export const generateMetadata = () => pageMetadata("history", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function HistoryPage() {
  return <PageView kind="history" banner="about" fallback={fallback} />;
}
