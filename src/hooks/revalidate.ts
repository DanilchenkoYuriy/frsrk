import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

/** Метка кеша, которую читают публичные страницы (см. src/lib/cms.ts). */
export const CONTENT_TAG = "content";

function bust() {
  try {
    revalidateTag(CONTENT_TAG, { expire: 0 });
  } catch {
    // вне запроса Next.js (например, при импорте данных) сбрасывать нечего
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  bust();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  bust();
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  bust();
  return doc;
};
