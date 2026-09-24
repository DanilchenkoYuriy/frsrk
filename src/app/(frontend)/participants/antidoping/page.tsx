import { getDocuments } from "@/lib/cms";
import { TextPage, textPageMetadata } from "@/components/ui/TextPage";
import { DocumentRow } from "@/components/documents/DocumentRow";

export const generateMetadata = () => textPageMetadata("antidoping", "Антидопинг");

const SERVICES = [
  { title: "Проверить препарат", text: "Сервис РУСАДА: можно ли принимать лекарство спортсмену.", href: "https://list.rusada.ru" },
  { title: "Пройти онлайн-курс", text: "Антидопинговое обучение и сертификат на платформе РУСАДА.", href: "https://course.rusada.ru" },
  { title: "Раздел «Спортсменам» на сайте РУСАДА", text: "Запрещённый список, терапевтическое использование, права и обязанности.", href: "https://www.rusada.ru/athletes/" },
  { title: "Сообщить о нарушении", text: "Форма РУСАДА для сообщений о допинге.", href: "https://rusada.ru/doping-control/investigations/report-about-doping/" },
];

export default async function AntidopingPage() {
  const docs = (await getDocuments()).filter((d) => d.category === "antidoping");
  return (
    <TextPage
      pageKey="antidoping"
      fallbackTitle="Антидопинг"
      section={{ key: "participants", href: "/participants/antidoping" }}
      after={
        <>
          <section style={{ marginTop: 40 }} aria-labelledby="ad-services">
            <h2 className="h3" id="ad-services">
              Сервисы РУСАДА
            </h2>
            <ul>
              {SERVICES.map((s) => (
                <li className="doc" key={s.href}>
                  <span className="doc__icon" aria-hidden="true">
                    WEB
                  </span>
                  <div>
                    <p className="doc__title">{s.title}</p>
                    <p className="doc__desc">{s.text}</p>
                  </div>
                  <div className="doc__side">
                    <a className="btn btn--line btn--sm" href={s.href} target="_blank" rel="noopener noreferrer">
                      Перейти
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          {docs.length > 0 ? (
            <section style={{ marginTop: 40 }} aria-labelledby="ad-docs">
              <h2 className="h3" id="ad-docs">
                Документы
              </h2>
              <ul>
                {docs.map((d) => (
                  <DocumentRow key={d.id} doc={d} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      }
    />
  );
}
