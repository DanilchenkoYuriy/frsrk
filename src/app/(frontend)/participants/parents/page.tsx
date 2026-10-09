import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";

const fallback = { title: "Родителям", slogan: SLOGANS.parents };

export const generateMetadata = () => pageMetadata("parents", fallback);

/** Текст и блоки страницы задаются в «Страницы сайта». */
export default function ParentsPage() {
  return <PageView kind="parents" banner="participants" fallback={fallback} />;
}
