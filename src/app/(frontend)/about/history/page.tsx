import { TextPage, textPageMetadata } from "@/components/ui/TextPage";

export const generateMetadata = () => textPageMetadata("history", "История");

export default function HistoryPage() {
  return <TextPage pageKey="history" fallbackTitle="История" section={{ key: "about", href: "/about/history" }} />;
}
