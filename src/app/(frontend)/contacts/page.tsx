import { getSettings } from "@/lib/cms";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { getSiteLayout } from "@/lib/layout";
import { telHref } from "@/lib/site";
import { PageView, pageMetadata } from "@/components/page/PageView";
import { SLOGANS } from "@/config/slogans";
import { ContactForm } from "@/components/contact/ContactForm";
import { ICONS } from "@/components/ui/Icons";

export const generateMetadata = () => pageMetadata("contacts", { title: "Контакты", description: "Телефон, почта и адрес ФРСРК. Форма обратной связи." });

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [{ topic }, s, { socials }] = await Promise.all([searchParams, getSettings(), getSiteLayout()]);
  return (
      <PageView
        kind="contacts"
        banner="contacts"
        fallback={{ title: "Контакты", lead: "Напишите нам или позвоните. Отвечаем на вопросы о занятиях, соревнованиях, судействе и открытии секций.", slogan: SLOGANS.contacts }}
        builtin={
          <>
      <div className="layout-2">
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
                    {s.address}
                    <a className="btn btn--line btn--sm place-map" href={`https://yandex.ru/maps/?text=${encodeURIComponent(s.address)}`} target="_blank" rel="noopener noreferrer">
                      {ICONS.pin}
                      Открыть на карте
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
          </>
        }
      />
  );
}
