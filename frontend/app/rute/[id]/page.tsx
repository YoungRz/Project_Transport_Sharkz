"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errMsg, Halte, Rute } from "@/app/lib/api";
import { Alert, Empty } from "@/app/components/ui";

type RuteDetail = Rute & { halte: Halte[] };

export default function RuteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RuteDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<RuteDetail>(`/rute/${id}`)
      .then(setData)
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  return (
    <>
      <Link href="/" className="back">
        ← Semua rute
      </Link>
      <Alert>{error}</Alert>

      {data && (
        <div className="stack">
          <div className="card">
            <span className="badge">{data.kode_rute}</span>
            <h1 style={{ margin: "10px 0 0", fontSize: 28 }}>{data.nama_rute}</h1>
            <div className="route-line" style={{ fontSize: 16 }}>
              <strong>{data.asal}</strong>
              <span className="arrow">→</span>
              <strong>{data.tujuan}</strong>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2 style={{ margin: 0 }}>Halte yang dilewati</h2>
              <span className="muted">{data.halte.length} halte</span>
            </div>
            {data.halte.length === 0 ? (
              <Empty>Belum ada halte di rute ini.</Empty>
            ) : (
              <ol className="timeline">
                {data.halte.map((h) => (
                  <li key={h.id}>
                    <span className="dot">{h.urutan}</span>
                    <strong>{h.nama_halte}</strong>
                    <span className="muted">{h.alamat ?? "—"}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}
