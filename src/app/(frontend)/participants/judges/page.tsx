import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "Судьям", slogan: SLOGANS.judges };

export const generateMetadata = () => pageMetadata("judges", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function JudgesPage() {
  return <PageView kind="judges" banner="participants" fallback={fallback} />;
}
