import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "Антидопинг", slogan: SLOGANS.antidoping };

export const generateMetadata = () => pageMetadata("antidoping", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function AntidopingPage() {
  return <PageView kind="antidoping" banner="participants" fallback={fallback} />;
}
