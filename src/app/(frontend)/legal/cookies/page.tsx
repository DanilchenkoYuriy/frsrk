import { TextPage, textPageMetadata } from "@/components/ui/TextPage";

export const generateMetadata = () => textPageMetadata("cookies", "Файлы cookie");

export default function CookiesPage() {
  return <TextPage pageKey="cookies" fallbackTitle="Файлы cookie" tabs={false} />;
}
