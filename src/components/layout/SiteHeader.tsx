import Link from "next/link";
import { getSettings } from "@/lib/cms";
import { ctaNav, mainNav } from "@/config/navigation";
import { SiteNav } from "@/components/layout/SiteNav";
import { TelegramIcon, VkIcon } from "@/components/ui/Icons";

export async function SiteHeader() {
  const s = await getSettings();
  // Название в две строки: «Федерация роуп скиппинга (спортивной скакалки)» и «Республики Крым»
  const tail = "Республики Крым";
  const split = s.fullName.endsWith(tail);
  const first = split ? s.fullName.slice(0, -tail.length).trim() : s.fullName;
  const second = split ? tail : "";
  return (
    <>
      <header className="brandbar">
        <div className="container brandbar__inner">
          <Link href="/" className="brand" aria-label={`${s.fullName}: на главную`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/brand/frsrk-logo.png" alt="Герб ФРСРК" width={577} height={433} />
            <span className="brand__name">
              <span className="brand__short">{s.shortName}</span>
              <span className="brand__line">{first}</span>
              {second ? <span className="brand__line">{second}</span> : null}
            </span>
          </Link>
          <div className="brandbar__tools">
            <p className="brandbar__slogan" aria-hidden="true">
              Сила в движении!
            </p>
            {s.vk ? (
              <a className="icon-btn" href={s.vk} target="_blank" rel="noopener noreferrer" aria-label="Сообщество ВКонтакте">
                <VkIcon />
              </a>
            ) : null}
            {s.telegram ? (
              <a className="icon-btn" href={s.telegram} target="_blank" rel="noopener noreferrer" aria-label="Канал в Telegram">
                <TelegramIcon />
              </a>
            ) : null}
          </div>
        </div>
      </header>
      <SiteNav items={mainNav} cta={ctaNav} vk={s.vk} telegram={s.telegram} />
    </>
  );
}
