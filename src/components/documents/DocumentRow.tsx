import type { DocumentDoc } from "@/lib/cms";
import { formatDate } from "@/lib/dates";

export function extensionOf(filename?: string | null): string {
  const ext = filename?.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "ФАЙЛ";
}

export function fileSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} МБ`;
}

export function DocumentRow({ doc }: { doc: Pick<DocumentDoc, "title" | "number" | "docDate" | "description" | "status" | "url" | "filename" | "filesize"> }) {
  const archived = doc.status === "archived";
  const meta = [doc.number ? `№ ${doc.number}` : null, doc.docDate ? formatDate(doc.docDate) : null, fileSize(doc.filesize)].filter(Boolean).join(" · ");
  return (
    <li className={`doc${archived ? " doc--old" : ""}`}>
      <span className="doc__icon" aria-hidden="true">
        {extensionOf(doc.filename)}
      </span>
      <div>
        <p className="doc__title">{doc.title}</p>
        {meta ? <p className="doc__meta">{meta}</p> : null}
        {doc.description ? <p className="doc__desc">{doc.description}</p> : null}
      </div>
      <div className="doc__side">
        {archived ? <span className="badge badge--gray">Утратил силу</span> : null}
        {doc.url ? (
          <a className="btn btn--line btn--sm" href={doc.url} target="_blank" rel="noopener noreferrer">
            Открыть
          </a>
        ) : null}
      </div>
    </li>
  );
}
