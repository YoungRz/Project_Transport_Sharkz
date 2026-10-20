// Setiap kode rute mendapat warna tetap, jadi K1 selalu berwarna sama di semua halaman.
const COLORS = ["#c1272d", "#1b5e9b", "#1f7a4d", "#b85c0a", "#6b3a8f", "#0b6b6b"];

export function routeColor(kode: string): string {
  let h = 0;
  for (const ch of kode) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function RouteBadge({ kode }: { kode: string }) {
  return (
    <span className="badge" style={{ background: routeColor(kode) }}>
      {kode}
    </span>
  );
}