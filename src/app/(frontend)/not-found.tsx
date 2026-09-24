import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";

export default function NotFound() {
  return (
    <>
      <PageHead title="Страница не найдена" lead="Возможно, адрес набран с ошибкой или страница была перемещена." />
      <div className="page">
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" className="btn btn--red">
            На главную
          </Link>
          <Link href="/sections" className="btn btn--line">
            Найти секцию
          </Link>
          <Link href="/calendar" className="btn btn--line">
            Календарь
          </Link>
        </div>
      </div>
    </>
  );
}
