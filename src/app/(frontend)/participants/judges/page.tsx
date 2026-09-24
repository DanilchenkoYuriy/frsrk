import { getDocuments } from "@/lib/cms";
import { TextPage, textPageMetadata } from "@/components/ui/TextPage";
import { DocumentRow } from "@/components/documents/DocumentRow";

export const generateMetadata = () => textPageMetadata("education-judges", "Судьям");

export default async function JudgesPage() {
  const docs = (await getDocuments()).filter((d) => d.category === "rules");
  return (
    <TextPage
      pageKey="education-judges"
      fallbackTitle="Судьям"
      section={{ key: "participants", href: "/participants/judges" }}
      after={
        docs.length > 0 ? (
          <section style={{ marginTop: 40 }} aria-labelledby="j-docs">
            <h2 className="h3" id="j-docs">
              Правила и положения о судействе
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
