import Link from "next/link";
import { TextPage, textPageMetadata } from "@/components/ui/TextPage";

export const generateMetadata = () => textPageMetadata("parents", "Родителям");

export default function ParentsPage() {
  return (
    <TextPage
      pageKey="parents"
      fallbackTitle="Родителям"
      section={{ key: "participants", href: "/participants/parents" }}
      after={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
          <Link href="/sections" className="btn btn--red">
            Найти секцию рядом
          </Link>
          <Link href="/documents?category=classification" className="btn btn--line">
            Разряды и ЕВСК
          </Link>
          <Link href="/participants/antidoping" className="btn btn--line">
            Антидопинг
          </Link>
        </div>
      }
    />
  );
}
