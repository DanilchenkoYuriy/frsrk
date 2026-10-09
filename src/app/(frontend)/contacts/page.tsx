import type { Metadata } from "next";
import { getSettings } from "@/lib/cms";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { getSiteLayout } from "@/lib/layout";
import { telHref } from "@/lib/site";
import { PageHead } from "@/components/ui/PageHead";
import { SLOGANS } from "@/config/slogans";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Телефон, почта и адрес ФРСРК. Форма обратной связи.",
};

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [{ topic }, s, { socials }] = await Promise.all([searchParams, getSettings(), getSiteLayout()]);
  return (
    <>
      <PageHead banner="contacts" slogan={SLOGANS.contacts} title="Контакты" lead="Напишите нам или позвоните. Отвечаем на вопросы о занятиях, соревнованиях, судействе и открытии секций." crumbs={[{ label: "Контакты" }]} />
      <div className="page">
        <div className="container layout-2">
          <div>
            <h2 className="h3" style={{ marginBottom: 24 }}>
              Написать в федерацию
            </h2>
            <ContactForm initialTopic={topic} />
          </div>
          <aside>
            <div className="aside-card">
              <h2 className="aside-card__title">Как с нами связаться</h2>
              <dl className="dl" style={{ margin: 0 }}>
                {s.phone ? (
                  <div>
                    <dt>Телефон</dt>
                    <dd>
                      <a href={telHref(s.phone)}>{s.phone}</a>
                    </dd>
                  </div>
                ) : null}
                {s.email ? (
                  <div>
                    <dt>Почта</dt>
                    <dd>
                      <a href={`mailto:${s.email}`}>{s.email}</a>
                    </dd>
                  </div>
                ) : null}
                {s.address ? (
                  <div>
                    <dt>Адрес</dt>
                    <dd>
                      {s.address}{" "}
                      <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(s.address)}`} target="_blank" rel="noopener noreferrer">
                        На карте
                      </a>
                    </dd>
                  </div>
                ) : null}
                {socials.map((social) => {
                  // У встроенных соцсетей заголовок — название сети, у своих — подпись из админки, а в ссылке сам адрес
                  const network = social.network === "other" ? null : SOCIAL_NETWORKS.find((n) => n.value === social.network)?.label;
                  return (
                    <div key={social.url}>
                      <dt>{network ?? social.label}</dt>
                      <dd>
                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                          {network ? social.label : social.url.replace(/^https?:\/\//, "")}
                        </a>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
