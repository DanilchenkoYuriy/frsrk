/** Структурированные данные schema.org для Яндекса и Google. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // «<» экранируется, чтобы текст из админки не мог закрыть тег script
  const json = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
