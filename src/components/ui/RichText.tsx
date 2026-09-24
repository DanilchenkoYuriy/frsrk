import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type Data = SerializedEditorState | null | undefined;

/** Есть ли в текстовом поле хотя бы один непустой абзац. */
export function hasContent(data: Data): boolean {
  const children = data?.root?.children as { children?: { text?: string }[]; type?: string }[] | undefined;
  if (!children?.length) return false;
  return children.some((node) => node.type !== "paragraph" || (node.children ?? []).some((c) => (c.text ?? "").trim() !== ""));
}

export function RichText({ data, className = "prose" }: { data: Data; className?: string }) {
  if (!data || !hasContent(data)) return null;
  return <PayloadRichText data={data} className={className} />;
}

interface LexNode {
  type?: string;
  tag?: string;
  children?: { text?: string }[];
}

export interface TextSection {
  title: string;
  data: SerializedEditorState;
}

/** Делит текст на разделы по заголовкам второго уровня: вступление и список разделов. */
export function splitByHeading(data: Data): { intro: SerializedEditorState | null; sections: TextSection[] } {
  if (!data?.root?.children) return { intro: null, sections: [] };
  const nodes = data.root.children as unknown as LexNode[];
  const wrap = (children: LexNode[]) => ({ ...data, root: { ...data.root, children } }) as unknown as SerializedEditorState;
  const introNodes: LexNode[] = [];
  const sections: { title: string; nodes: LexNode[] }[] = [];
  for (const node of nodes) {
    if (node.type === "heading" && node.tag === "h2") {
      sections.push({ title: (node.children ?? []).map((c) => c.text ?? "").join(""), nodes: [node] });
    } else if (sections.length) {
      sections[sections.length - 1].nodes.push(node);
    } else {
      introNodes.push(node);
    }
  }
  return {
    intro: introNodes.length ? wrap(introNodes) : null,
    sections: sections.map((s) => ({ title: s.title, data: wrap(s.nodes) })),
  };
}
