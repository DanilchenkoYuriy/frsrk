import type { Person, Media } from "@/lib/cms";
import { populated } from "@/lib/cms";
import { Picture } from "@/components/ui/Picture";
import { telHref } from "@/lib/site";

/** Карточка человека: фото, ФИО, должность, контакты. */
export function PersonCard({ p }: { p: Person }) {
  return (
    <li className="person">
      {populated<Media>(p.photo) ? (
        <div className="person__photo">
          <Picture media={p.photo} sizes="(min-width: 900px) 280px, 50vw" />
        </div>
      ) : null}
      <div>
        <p className="person__name">{p.name}</p>
        <p className="person__role">{p.position}</p>
        {p.bio ? <p style={{ marginTop: 8 }}>{p.bio}</p> : null}
        {p.phone ? (
          <p style={{ marginTop: 8 }}>
            <a href={telHref(p.phone)}>{p.phone}</a>
          </p>
        ) : null}
        {p.email ? (
          <p>
            <a href={`mailto:${p.email}`}>{p.email}</a>
          </p>
        ) : null}
      </div>
    </li>
  );
}
