import { TextPage, textPageMetadata } from "@/components/ui/TextPage";

export const generateMetadata = () => textPageMetadata("about", "О федерации");

export default function AboutPage() {
  return <TextPage pageKey="about" fallbackTitle="О федерации" section={{ key: "about", href: "/about" }} tabs={false} />;
}
