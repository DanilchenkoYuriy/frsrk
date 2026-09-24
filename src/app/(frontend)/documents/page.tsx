import type { Metadata } from "next";
import { getDocuments } from "@/lib/cms";
import { DOCUMENT_CATEGORIES, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { SLOGANS } from "@/config/slogans";
import { DocumentsPage } from "@/components/documents/DocumentsPage";
import { DocumentCards } from "@/components/documents/DocumentCards";
import { extensionOf, fileSize } from "@/components/documents/DocumentRow";

export const metadata: Metadata = {
  title: "Документы",
  description: "Устав, правила вида спорта, ЕВСК, положения, приказы и музыка для соревнований ФРСРК.",
};

const norm = (v: string) => v.toLowerCase().replace(/ё/g, "е");

export default async function DocumentsRoute({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const { category, q } = await searchParams;
  const all = await getDocuments();
  const cat = DOCUMENT_CATEGORIES.find((c) => c.value === category);
  const query = norm((q ?? "").trim());
  const order = (c: string) => DOCUMENT_CATEGORIES.findIndex((x) => x.value === c);

  const shown = [...all]
    .filter((d) => d.url && (!cat || d.category === cat.value) && (!query || norm(`${d.title} ${d.description ?? ""} ${d.number ?? ""}`).includes(query)))
    .sort((a, b) => order(a.category) - order(b.category) || (a.order ?? 100) - (b.order ?? 100));

  return (
    <DocumentsPage active={cat ? cat.value : "all"} title="Документы" lead="Документы федерации и вида спорта. Файлы хранятся на сервере ФРСРК." slogan={SLOGANS.documents} q={q}>
      <div className="shell__head">
        <div>
          <h2 className="h3" style={{ marginBottom: 4 }}>
            {cat ? cat.label : query ? "Результаты поиска" : "Все документы"}
          </h2>
          {cat ? <p className="block__lead" style={{ marginTop: 0 }}>{cat.description}</p> : null}
        </div>
        <span className="shell__found">Найдено: {shown.length}</span>
      </div>
      {shown.length ? (
        <DocumentCards
          docs={shown.map((d) => ({
            id: d.id,
            title: d.title,
            categoryLabel: DOCUMENT_CATEGORIES.find((c) => c.value === d.category)?.label ?? labelOf([], d.category),
            number: d.number ?? undefined,
            dateLabel: d.docDate ? formatDate(d.docDate) : undefined,
            description: d.description ?? undefined,
            old: d.status === "archived",
            url: d.url as string,
            ext: extensionOf(d.filename),
            size: fileSize(d.filesize),
          }))}
        />
      ) : (
        <p className="empty">{all.length ? "По вашему запросу документов не найдено." : "Документы пока не опубликованы."}</p>
      )}
    </DocumentsPage>
  );
}
