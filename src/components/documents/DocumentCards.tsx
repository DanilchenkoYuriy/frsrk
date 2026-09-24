"use client";

import { useState } from "react";

export interface DocView {
  id: number;
  title: string;
  categoryLabel: string;
  number?: string;
  dateLabel?: string;
  description?: string;
  old: boolean;
  url: string;
  ext: string;
  size: string;
}

const EXT_CLASS: Record<string, string> = {
  PDF: "ficon--pdf",
  XLS: "ficon--xls",
  XLSX: "ficon--xls",
  DOC: "ficon--doc",
  DOCX: "ficon--doc",
  PPT: "ficon--ppt",
  PPTX: "ficon--ppt",
};

function FileIcon({ ext }: { ext: string }) {
  return (
    <span className={`ficon ${EXT_CLASS[ext] ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />
      </svg>
      <span>{ext}</span>
    </span>
  );
}

/** Документы плитками или списком: переключатель справа сверху. */
export function DocumentCards({ docs }: { docs: DocView[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div className="viewtoggle" role="group" aria-label="Вид списка">
        <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")} aria-label="Плитки">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
          </svg>
        </button>
        <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="Список">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        </button>
      </div>

      {view === "grid" ? (
        <ul className="dcards">
          {docs.map((d) => (
            <li key={d.id} className="dcard">
              <div className="dcard__top">
                <FileIcon ext={d.ext} />
                {d.old ? <span className="badge badge--gray">Утратил силу</span> : null}
              </div>
              <h3 className="dcard__title">{d.title}</h3>
              <p className="dcard__cat">{d.categoryLabel}</p>
              {d.description ? <p className="dcard__desc">{d.description}</p> : null}
              <p className="dcard__meta">{[d.number ? `№ ${d.number}` : null, d.dateLabel, d.size].filter(Boolean).join(" · ")}</p>
              <a className="btn btn--line btn--sm dcard__btn" href={d.url} target="_blank" rel="noopener noreferrer">
                Скачать
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {docs.map((d) => (
            <li key={d.id} className={`doc${d.old ? " doc--old" : ""}`}>
              <FileIcon ext={d.ext} />
              <div>
                <p className="doc__title">{d.title}</p>
                <p className="doc__meta">{[d.categoryLabel, d.number ? `№ ${d.number}` : null, d.dateLabel, d.size].filter(Boolean).join(" · ")}</p>
                {d.description ? <p className="doc__desc">{d.description}</p> : null}
              </div>
              <div className="doc__side">
                {d.old ? <span className="badge badge--gray">Утратил силу</span> : null}
                <a className="btn btn--line btn--sm" href={d.url} target="_blank" rel="noopener noreferrer">
                  Скачать
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
