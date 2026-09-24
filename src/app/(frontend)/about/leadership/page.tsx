import type { Metadata } from "next";
import { getMunicipalities, getPage, getPeople, populated, type Media, type Person } from "@/lib/cms";
import { SectionPage } from "@/components/section/SectionPage";
import { SLOGANS } from "@/config/slogans";
import { Picture } from "@/components/ui/Picture";
import { Empty } from "@/components/ui/Wip";
import { RichText } from "@/components/ui/RichText";
import { telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Руководство и представители",
  description: "Руководство ФРСРК и представители федерации в муниципальных образованиях Республики Крым.",
};

function PersonCard({ p }: { p: Person }) {
  return (
    <li className="person">
      {populated<Media>(p.photo) ? (
        <div className="person__photo">
          <Picture media={p.photo} sizes="(min-width: 900px) 280px, 50vw" />
        </div>
      ) : null}
      <div>
        <p className="person__name">{p.name}</p>
        <p className="person__role">{p.position}</p>
        {p.bio ? <p style={{ marginTop: 8 }}>{p.bio}</p> : null}
        {p.phone ? (
          <p style={{ marginTop: 8 }}>
            <a href={telHref(p.phone)}>{p.phone}</a>
          </p>
        ) : null}
        {p.email ? (
          <p>
            <a href={`mailto:${p.email}`}>{p.email}</a>
          </p>
        ) : null}
      </div>
    </li>
  );
}

export default async function LeadershipPage() {
  const [people, page, municipalities] = await Promise.all([getPeople(), getPage("leadership"), getMunicipalities()]);
  const leaders = people.filter((p) => p.group === "leadership");
  const reps = municipalities
    .map((m) => ({ city: m.name, person: populated<Person>(m.representative) }))
    .filter((r): r is { city: string; person: Person } => Boolean(r.person));

  return (
    <SectionPage section="about" href="/about/leadership" title="Руководство и представители" lead={page?.lead} slogan={SLOGANS.leadership}>
      <div style={{ display: "grid", gap: 44 }}>
        <RichText data={page?.body} />
        <section aria-labelledby="leaders">
          <h2 className="h3" id="leaders">
            Руководство федерации
          </h2>
          {leaders.length ? (
            <ul className="people">
              {leaders.map((p) => (
                <PersonCard key={p.id} p={p} />
              ))}
            </ul>
          ) : (
            <Empty>Сведения о руководстве готовятся к публикации.</Empty>
          )}
        </section>
        {reps.length > 0 ? (
          <section aria-labelledby="reps">
            <h2 className="h3" id="reps">
              Представители в муниципальных образованиях
            </h2>
            <ul className="people">
              {reps.map(({ city, person }) => (
                <PersonCard key={city} p={{ ...person, position: `${city}. ${person.position}` }} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SectionPage>
  );
}
