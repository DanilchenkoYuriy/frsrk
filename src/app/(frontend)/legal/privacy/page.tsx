import { TextPage, textPageMetadata } from "@/components/ui/TextPage";

export const generateMetadata = () => textPageMetadata("privacy", "Политика обработки персональных данных");

export default function PrivacyPage() {
  return <TextPage pageKey="privacy" fallbackTitle="Политика обработки персональных данных" tabs={false} />;
}
