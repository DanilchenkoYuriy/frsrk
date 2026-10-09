import { getRanking, populated, type Municipality } from "@/lib/cms";
import { AGE_GROUPS, DISCIPLINES, GENDERS, labelOf } from "@/lib/constants";
import { SLOGANS } from "@/config/slogans";
import { PageView, pageMetadata } from "@/components/page/PageView";
import { Wip } from "@/components/ui/Wip";
import { RankingExplorer, type RankRow } from "@/components/ranking/RankingExplorer";

export const generateMetadata = () => pageMetadata("ranking", { title: "Рейтинг спортсменов", description: "Рейтинг спортсменов Республики Крым по дисциплинам, возрастным группам и сезонам." });

export default async function RankingPage() {
  const entries = await getRanking();
  const rows: RankRow[] = entries.map((e) => ({
    id: e.id,
    athlete: e.athlete,
    season: e.season,
    discipline: e.discipline,
    disciplineLabel: labelOf(DISCIPLINES, e.discipline),
    ageGroup: e.ageGroup,
    ageLabel: labelOf(AGE_GROUPS, e.ageGroup),
    gender: e.gender,
    genderLabel: labelOf(GENDERS, e.gender),
    city: populated<Municipality>(e.municipality)?.name ?? "",
    club: e.club ?? "",
    starts: e.starts ?? null,
    points: e.points,
  }));

  return (
    <PageView
      kind="ranking"
      banner="participants"
      fallback={{ title: "Рейтинг спортсменов", lead: "Результаты спортсменов Республики Крым по сезонам, дисциплинам и возрастным группам.", slogan: SLOGANS.ranking }}
      builtin={
        <>
      {rows.length ? (
        <RankingExplorer rows={rows} />
      ) : (
        <Wip title="Рейтинг в разработке">
          <>Раздел формируется по итогам спортивного сезона. Сведения вносит Федерация роуп скиппинга (спортивной скакалки) Республики Крым.</>
        </Wip>
      )}
        </>
      }
    />
  );
}
