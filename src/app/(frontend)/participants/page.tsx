import { redirect } from "next/navigation";
import { PageView } from "@/components/page/PageView";
import { getSiteTree } from "@/lib/layout";

/** «Участникам»: если у страницы нет своих блоков, открывается первый пункт раздела. */
export default async function ParticipantsPage() {
  const tree = await getSiteTree();
  const node = tree.byKind("participants");
  const landing = node ? tree.landing(node) : null;
  if (!landing || landing.id !== node?.id) redirect(landing?.href ?? "/participants/coaches");
  return <PageView kind="participants" banner="participants" fallback={{ title: "Участникам" }} />;
}
