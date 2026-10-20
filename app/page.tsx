"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { api, errMsg } from "./lib/api";
import type { Halte, Rute } from "./lib/api";
import RouteBadge, { routeColor } from "./components/routebadge";
import Notice from "./components/notice";

export default function HomePage() {
  const [rute, setRute] = useState<Rute[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [halte, setHalte] = useState<Record<number, Halte[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    api<Rute[]>("/rute")
      .then(setRute)
      .catch((e) => setError(errMsg(e)));
  }, []);

  const hasil = useMemo(() => {
    if (!rute) return [];
    const k = q.trim().toLowerCase();
    if (!k) return rute;
    return rute.filter((r) =>
      [r.kode_rute, r.nama_rute, r.asal, r.tujuan].some((v) => v.toLowerCase().includes(k)),
    );
  }, [rute, q]);

  async function toggle(id: number) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (halte[id]) return;
    setLoadingId(id);
    try {
      const detail = await api<Rute>(`/rute/${id}`);
      setHalte((h) => ({ ...h, [id]: detail.halte ?? [] }));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Rute</h1>
          <p className="lede">Pilih satu rute untuk melihat halte yang dilewati, berurutan dari awal sampai tujuan.</p>
        </div>
        <div className="search">
          <label htmlFor="cari" className="sr-only">
            Cari rute
          </label>
          <input
            id="cari"
            className="input"
            type="search"
            placeholder="Cari kode, nama, atau tempat"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <Notice kind="bad">{error}</Notice>}
      {!rute && !error && <p className="hint">Memuat rute…</p>}

      {rute && hasil.length === 0 && (
        <div className="empty">
          {rute.length === 0
            ? "Belum ada rute. Admin bisa menambahkannya di Panel admin."
            : "Tidak ada rute yang cocok dengan pencarianmu."}
        </div>
      )}

      {hasil.length > 0 && (
        <ul className="routes">
          {hasil.map((r) => {
            const open = openId === r.id;
            const stops = halte[r.id];
            return (
              <li key={r.id} className="route" style={{ "--route": routeColor(r.kode_rute) } as CSSProperties}>
                <div className="route-row">
                  <RouteBadge kode={r.kode_rute} />
                  <div>
                    <div className="route-name">{r.nama_rute}</div>
                    <div className="route-path">
                      {r.asal} – {r.tujuan}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-expanded={open}
                    onClick={() => toggle(r.id)}
                  >
                    {open ? "Tutup halte" : "Lihat halte"}
                  </button>
                </div>

                {open && (
                  <div className="route-detail">
                    {loadingId === r.id && <p className="hint">Memuat halte…</p>}
                    {stops && stops.length === 0 && (
                      <p className="hint">Rute ini belum punya halte.</p>
                    )}
                    {stops && stops.length > 0 && (
                      <ol className="stops">
                        {stops.map((h) => (
                          <li key={h.id} className="stop">
                            <div className="stop-name">
                              <span className="stop-no">{h.urutan}</span>
                              {h.nama_halte}
                            </div>
                            {h.alamat && <div className="stop-addr">{h.alamat}</div>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}