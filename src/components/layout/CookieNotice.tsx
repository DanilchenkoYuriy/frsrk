"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";

const KEY = "frsrk-cookie-consent";
const EVENT = "frsrk-cookie-consent-change";

type Consent = "yes" | "no" | "none" | "unknown";

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : "none";
  } catch {
    return "none";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Уведомление о cookie. Яндекс.Метрика подключается только после согласия. */
export function CookieNotice({ metrikaId }: { metrikaId?: string | null }) {
  // На сервере и при первой отрисовке решение неизвестно: уведомление не мигает у тех, кто уже выбрал.
  const consent = useSyncExternalStore<Consent>(subscribe, readConsent, () => "unknown");

  const choose = (value: "yes" | "no") => {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // браузер запретил хранение: решение действует до перезагрузки страницы
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const id = metrikaId?.replace(/\D/g, "");

  return (
    <>
      {consent === "yes" && id ? (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
        </Script>
      ) : null}
      <div className="cookie" role="region" aria-label="Уведомление о cookie" hidden={consent !== "none"}>
        <p>
          Сайт использует файлы cookie для работы и статистики посещений.{" "}
          <Link href="/legal/cookies">Подробнее</Link>
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => choose("no")}>
          Только необходимые
        </button>
        <button type="button" className="btn btn--red" onClick={() => choose("yes")}>
          Принять
        </button>
      </div>
    </>
  );
}
