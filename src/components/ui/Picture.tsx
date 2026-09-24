import type { CSSProperties } from "react";
import type { Media } from "@/payload-types";
import { populated } from "@/lib/cms";

interface Props {
  media: number | Media | null | undefined;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Картинка из хранилища. Браузер сам выбирает подходящий размер
 * из уже подготовленных версий (card 800 px, wide 1600 px).
 */
export function Picture({ media, alt, sizes = "100vw", priority = false, className, style }: Props) {
  const m = populated<Media>(media);
  if (!m?.url) return null;

  const candidates = [m.sizes?.card, m.sizes?.wide]
    .filter((s): s is NonNullable<typeof s> => Boolean(s?.url && s.width))
    .map((s) => ({ url: s.url as string, width: s.width as number }));

  const srcSet = candidates.length ? candidates.map((c) => `${c.url} ${c.width}w`).join(", ") : undefined;
  const src = candidates.length ? candidates[candidates.length - 1].url : m.url;
  const objectPosition = m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt ?? m.alt ?? ""}
      width={m.width ?? undefined}
      height={m.height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ objectPosition, ...style }}
    />
  );
}
