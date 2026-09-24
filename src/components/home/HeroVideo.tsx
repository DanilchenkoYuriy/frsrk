"use client";

import { useRef, useState, useSyncExternalStore } from "react";

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Фоновое видео первого экрана. Не показывается (остаётся фото), если у посетителя
 * включено «уменьшить движение» или экран узкий, а показ на телефонах выключен в админке.
 */
export function HeroVideo({ src, allowMobile }: { src: string; allowMobile: boolean }) {
  const wide = useMedia("(min-width: 761px)");
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);

  if (still || (!wide && !allowMobile)) return null;

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <div className="hero__media hero__media--video" aria-hidden="true">
        <video ref={ref} className={`hero__video${ready ? " is-ready" : ""}`} src={src} autoPlay muted loop playsInline preload="auto" tabIndex={-1} onCanPlay={() => setReady(true)} />
      </div>
      <button type="button" className="hero__pause" onClick={toggle} aria-label={playing ? "Остановить видео" : "Запустить видео"}>
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14M16 5v14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5l11 7-11 7z" />
          </svg>
        )}
      </button>
    </>
  );
}
