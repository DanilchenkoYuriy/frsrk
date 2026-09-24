export function AdminLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/frsrk-logo.png" alt="" width={64} height={48} />
      <strong style={{ fontSize: 20, letterSpacing: 0.3, color: "var(--theme-text)" }}>ФРСРК: управление сайтом</strong>
    </div>
  );
}
