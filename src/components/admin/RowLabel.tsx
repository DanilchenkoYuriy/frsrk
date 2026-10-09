"use client";

import { useRowLabel } from "@payloadcms/ui";
import { SOCIAL_NETWORKS } from "@/lib/constants";

interface Row {
  label?: string;
  title?: string;
  network?: string;
  hidden?: boolean;
}

/** Подпись строки в списках админки: название пункта и отметка «скрыто». */
export function RowLabel() {
  const { data, rowNumber } = useRowLabel<Row>();
  const name = data?.label || data?.title || SOCIAL_NETWORKS.find((n) => n.value === data?.network)?.label || `Строка ${(rowNumber ?? 0) + 1}`;
  return (
    <span style={{ opacity: data?.hidden ? 0.55 : 1 }}>
      {name}
      {data?.hidden ? " (скрыто)" : ""}
    </span>
  );
}
