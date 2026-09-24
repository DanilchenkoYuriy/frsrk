import { getDocuments } from "@/lib/cms";
import { TextPage, textPageMetadata } from "@/components/ui/TextPage";
import { DocumentRow } from "@/components/documents/DocumentRow";

export const generateMetadata = () => textPageMetadata("education-coaches", "Тренерам");

export default async function CoachesPage() {
  const docs = (await getDocuments()).filter((d) => d.category === "education");
  return (
    <TextPage
      pageKey="education-coaches"
      fallbackTitle="Тренерам"
      section={{ key: "participants", href: "/participants/coaches" }}
      after={
        docs.length > 0 ? (
          <section style={{ marginTop: 40 }} aria-labelledby="c-docs">
            <h2 className="h3" id="c-docs">
              Стандарты и программы подготовки
            </h2>
            <ul>
              {docs.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
            </ul>
          </section>
        ) : null
      }
    />
  );
}
