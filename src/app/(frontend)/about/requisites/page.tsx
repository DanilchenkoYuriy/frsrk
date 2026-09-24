import type { Metadata } from "next";
import { getDocuments, getSettings } from "@/lib/cms";
import { formatDate } from "@/lib/dates";
import { telHref } from "@/lib/site";
import { SLOGANS } from "@/config/slogans";
import { SectionPage } from "@/components/section/SectionPage";
import { DocumentRow } from "@/components/documents/DocumentRow";

export const metadata: Metadata = {
  title: "Реквизиты и аккредитация",
  description: "Полное наименование, ОГРН, адрес и сведения о государственной аккредитации ФРСРК.",
};

export default async function RequisitesPage() {
  const [s, docs] = await Promise.all([getSettings(), getDocuments()]);
  const federationDocs = docs.filter((d) => d.category === "federation");
  const acc = s.accreditation;

  const rows: [string, string | null | undefined][] = [
    ["Полное наименование", s.fullName],
    ["Наименование по Уставу", s.legalName],
    ["ОГРН", s.ogrn],
    ["ИНН", s.inn],
    ["КПП", s.kpp],
    ["Адрес", s.address],
    ["Телефон", s.phone],
    ["Почта", s.email],
  ];

  return (
    <SectionPage section="about" href="/about/requisites" title="Реквизиты и аккредитация" lead="Сведения об организации, государственной аккредитации и учредительные документы." slogan={SLOGANS.requisites}>
      <div style={{ display: "grid", gap: 32 }}>
        <div className="aside-card">
          <h2 className="aside-card__title">Реквизиты организации</h2>
          <dl className="dl dl--cols">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{k === "Телефон" ? <a href={telHref(v!)}>{v}</a> : k === "Почта" ? <a href={`mailto:${v}`}>{v}</a> : v}</dd>
                </div>
              ))}
            {s.bankDetails ? (
              <div>
                <dt>Банковские реквизиты</dt>
                <dd style={{ whiteSpace: "pre-line" }}>{s.bankDetails}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {acc?.orderNumber ? (
          <div className="aside-card">
            <h2 className="aside-card__title">Государственная аккредитация</h2>
            <dl className="dl dl--cols">
              <div>
                <dt>Приказ</dt>
                <dd>
                  № {acc.orderNumber}
                  {acc.orderDate ? ` от ${formatDate(acc.orderDate)}` : ""}
                </dd>
              </div>
              {acc.issuedBy ? (
                <div>
                  <dt>Кем выдана</dt>
                  <dd>{acc.issuedBy}</dd>
                </div>
              ) : null}
              {acc.term ? (
                <div>
                  <dt>Срок</dt>
                  <dd>{acc.term}</dd>
                </div>
              ) : null}
              {acc.vrvsCode ? (
                <div>
                  <dt>Код вида спорта по ВРВС</dt>
                  <dd>{acc.vrvsCode}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {federationDocs.length > 0 ? (
          <section aria-labelledby="req-docs">
            <h2 className="h3" id="req-docs">
              Учредительные документы и аккредитация
            </h2>
            <ul>
              {federationDocs.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SectionPage>
  );
}
