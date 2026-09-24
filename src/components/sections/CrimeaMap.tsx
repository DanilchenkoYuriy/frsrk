"use client";

import Link from "next/link";
import mapData from "@/data/crimea-map.json";
import { SEVASTOPOL_NOTE } from "@/lib/constants";

interface Region {
  name: string;
  d: string;
  area: number;
  cx: number;
  cy: number;
}

const regions = Object.entries(mapData.regions as Record<string, Region>)
  // крупные районы рисуем первыми, городские округа поверх них
  .sort((a, b) => b[1].area - a[1].area);

export interface MapMunicipality {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  municipalities: MapMunicipality[];
  selected?: string | null;
  onSelect?: (slug: string | null) => void;
  /** Если задан, области работают как ссылки: `${hrefBase}${slug}` */
  hrefBase?: string;
}

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "секция";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "секции";
  return "секций";
};

export function CrimeaMap({ municipalities, selected, onSelect, hrefBase }: Props) {
  const bySlug = new Map(municipalities.map((m) => [m.slug, m]));

  const renderRegion = ([slug, region]: [string, Region]) => {
    const m = bySlug.get(slug);
    const count = m?.count ?? 0;
    const name = m?.name ?? region.name;
    const label = `${name}: ${count ? `${count} ${plural(count)}` : "секций пока нет"}`;
    const cls = ["crimea-map__region", count ? "crimea-map__region--has" : "", slug === "sevastopol" ? "crimea-map__region--fed" : "", selected === slug ? "crimea-map__region--active" : ""].join(" ");

    if (hrefBase) {
      return (
        <Link key={slug} href={`${hrefBase}${slug}`} aria-label={label}>
          <path className={cls} d={region.d} fillRule="evenodd">
            <title>{label}</title>
          </path>
        </Link>
      );
    }
    if (onSelect) {
      const toggle = () => onSelect(selected === slug ? null : slug);
      return (
        <path
          key={slug}
          className={cls}
          d={region.d}
          fillRule="evenodd"
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-pressed={selected === slug}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
        >
          <title>{label}</title>
        </path>
      );
    }
    return (
      <path key={slug} className={cls} d={region.d} fillRule="evenodd">
        <title>{label}</title>
      </path>
    );
  };

  const active = selected ? mapData.regions[selected as keyof typeof mapData.regions] : null;

  return (
    <div className="map-card">
      <svg className="crimea-map" viewBox={mapData.viewBox} role="group" aria-label="Карта Республики Крым по муниципальным образованиям">
        {regions.map(renderRegion)}
        {regions.map(([slug, region]) => {
          const count = bySlug.get(slug)?.count ?? 0;
          if (!count) return null;
          return (
            <g key={`c-${slug}`} transform={`translate(${region.cx} ${region.cy})`} aria-hidden="true">
              <circle className="crimea-map__badge" r="16" />
              <text className="crimea-map__count" y="5.5">
                {count}
              </text>
            </g>
          );
        })}
        {active && selected ? (
          <text className="crimea-map__label" x={active.cx} y={Math.max(30, active.cy - 26)} aria-hidden="true">
            {bySlug.get(selected)?.name ?? active.name}
          </text>
        ) : null}
      </svg>
      <div className="map-legend">
        <span style={{ ["--swatch" as string]: "var(--blue-600)" }}>Есть секции</span>
        <span style={{ ["--swatch" as string]: "#cfe2f7" }}>Секций пока нет</span>
        <span style={{ ["--swatch" as string]: "var(--red-500)" }}>Выбрано</span>
      </div>
      {bySlug.has("sevastopol") ? <p className="map-note">{SEVASTOPOL_NOTE}</p> : null}
      <p className="map-note map-note--credit">Границы: © участники OpenStreetMap, Natural Earth</p>
    </div>
  );
}
