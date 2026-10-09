import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "О федерации", slogan: SLOGANS.about };

export const generateMetadata = () => pageMetadata("about", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function AboutPage() {
  return <PageView kind="about" banner="about" fallback={fallback} />;
}
