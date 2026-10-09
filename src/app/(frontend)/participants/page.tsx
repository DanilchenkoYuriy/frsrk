import { redirect } from "next/navigation";
import { getSiteSection } from "@/lib/cms";
import { sectionItems } from "@/components/section/SectionPage";

/** «Участникам» открывает первый видимый пункт раздела из админки. */
export default async function ParticipantsPage() {
  const section = await getSiteSection("participants");
  const first = section ? sectionItems(section).find((i) => i.href !== "/participants") : null;
  redirect(first?.href ?? "/participants/coaches");
}
