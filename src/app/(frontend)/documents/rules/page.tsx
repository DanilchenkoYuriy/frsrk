import type { Metadata } from "next";
import { getDocuments, getPage } from "@/lib/cms";
import { DISCIPLINE_CARDS } from "@/config/disciplines";
import { SLOGANS } from "@/config/slogans";
import { DocumentsPage } from "@/components/documents/DocumentsPage";
import { extensionOf, fileSize } from "@/components/documents/DocumentRow";
import { RichText, hasContent, splitByHeading } from "@/components/ui/RichText";
import { Tabs } from "@/components/ui/Tabs";
import { Wip } from "@/components/ui/Wip";

export const metadata: Metadata = {
  title: "Правила вида спорта",
  description: "Правила вида спорта «роуп скиппинг (спортивная скакалка)», утверждённые приказом Минспорта России № 264 от 29 марта 2022 года.",
};

/** Короткие названия вкладок для разделов правил */
const SHORT: Record<string, string> = {
  "1": "Общие положения",
  "2": "Возрастные группы",
  "3": "Участники",
  "4": "Организаторы",
  "5": "Проведение соревнований",
  "6": "Протесты",
  "7": "Судейская коллегия",
};

export default async function RulesPage() {
  const [docs, page] = await Promise.all([getDocuments(), getPage("rules")]);
  const file = docs.find((d) => d.category === "rules" && d.number === "264" && d.url);
  const filled = Boolean(page && hasContent(page.body as never));
  const { intro, sections } = filled ? splitByHeading(page!.body) : { intro: null, sections: [] };

  const disciplines = (
    <div>
      <p className="block__lead" style={{ margin: "0 0 20px" }}>
        Дисциплины делятся на личные и командные. Соревнования проводятся в дисциплинах по Всероссийскому реестру видов спорта.
      </p>
      {(["personal", "team"] as const).map((kind) => (
        <section key={kind} style={{ marginBottom: 28 }}>
          <h3 className="h3">{kind === "personal" ? "Личные дисциплины" : "Командные дисциплины"}</h3>
          <ul className="dcards">
            {DISCIPLINE_CARDS.filter((d) => d.kind === kind).map((d) => (
              <li key={d.name} className="dcard">
                <h4 className="dcard__title">{d.name}</h4>
                <p className="dcard__desc" style={{ WebkitLineClamp: "unset" }}>
                  {d.text}
                </p>
                <div className="ev__badges">
                  <span className="badge">{d.athletes}</span>
                  {d.time ? <span className="badge badge--gold">{d.time}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  const tabs = [
    { id: "disciplines", label: "Дисциплины", content: disciplines },
    ...sections.map((s, i) => {
      const num = s.title.match(/^(\d)\./)?.[1] ?? "";
      return { id: `r${i}`, label: SHORT[num] ?? s.title, content: <RichText data={s.data} /> };
    }),
  ];

  return (
    <DocumentsPage active="rules-text" title="Правила вида спорта" lead="Правила вида спорта «роуп скиппинг (спортивная скакалка)»." slogan={SLOGANS.rules} crumbLabel="Правила вида спорта">
      <div className="rules-file">
        <div>
          <p className="rules-file__label">Приказ Минспорта России</p>
          <h2 className="rules-file__title">№ 264 от 29 марта 2022 года</h2>
          <p className="rules-file__text">Правила разработаны в соответствии с правилами Международной федерации роуп скиппинга (IRSO) и распространяются на все официальные соревнования на территории Российской Федерации.</p>
        </div>
        {file?.url ? (
          <a className="btn btn--red" href={file.url} target="_blank" rel="noopener noreferrer">
            Скачать правила, {extensionOf(file.filename)} {fileSize(file.filesize)}
          </a>
        ) : null}
      </div>

      {filled ? (
        <>
          {intro ? <RichText data={intro} /> : null}
          <Tabs label="Разделы правил" tabs={tabs} sticky />
        </>
      ) : (
        <>
          <Wip title="Текст правил готовится">Полный текст правил загружен файлом, скачайте его кнопкой выше.</Wip>
          <div style={{ marginTop: 28 }}>{disciplines}</div>
        </>
      )}
    </DocumentsPage>
  );
}
