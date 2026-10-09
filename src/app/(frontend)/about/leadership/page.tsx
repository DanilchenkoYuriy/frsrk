import { getMunicipalities, getPeople, populated, type Person } from "@/lib/cms";
import { PersonCard } from "@/components/people/PersonCard";
import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";
import { Empty } from "@/components/ui/Wip";

export const generateMetadata = () => pageMetadata("leadership", { title: "Руководство и представители", description: "Руководство ФРСРК и представители федерации в муниципальных образованиях Республики Крым." });

export default async function LeadershipPage() {
  const [people, municipalities] = await Promise.all([getPeople(), getMunicipalities()]);
  const leaders = people.filter((p) => p.group === "leadership");
  const reps = municipalities
    .map((m) => ({ city: m.name, person: populated<Person>(m.representative) }))
    .filter((r): r is { city: string; person: Person } => Boolean(r.person));

  return (
    <PageView
      kind="leadership"
      banner="about"
      fallback={{ title: "Руководство и представители", slogan: SLOGANS.leadership }}
      builtin={
        <>
      <div style={{ display: "grid", gap: 44 }}>
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
        </>
      }
    />
  );
}
