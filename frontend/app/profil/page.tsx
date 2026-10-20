"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth, useGuard } from "@/app/lib/auth";
import { api, errMsg } from "@/app/lib/api";
import { Alert, Field } from "@/app/components/ui";

export default function ProfilPage() {
  const { ok, user } = useGuard();
  const { updateUser } = useAuth();

  const [nama, setNama] = useState("");
  const [namaMsg, setNamaMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [pw, setPw] = useState({ lama: "", baru: "" });
  const [pwMsg, setPwMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (user) setNama(user.nama);
  }, [user]);

  if (!ok || !user) return null;

  async function saveNama(e: FormEvent) {
    e.preventDefault();
    setNamaMsg(null);
    try {
      const res = await api<{ message: string; nama: string }>("/users/me", { method: "PUT", body: { nama } });
      updateUser({ nama: res.nama });
      setNamaMsg({ kind: "success", text: res.message });
    } catch (err) {
      setNamaMsg({ kind: "error", text: errMsg(err) });
    }
  }

  async function savePw(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.baru.length < 8) {
      setPwMsg({ kind: "error", text: "Password baru minimal 8 karakter" });
      return;
    }
    try {
      const res = await api<{ message: string }>("/users/me/password", {
        method: "PUT",
        body: { password_lama: pw.lama, password_baru: pw.baru },
      });
      setPw({ lama: "", baru: "" });
      setPwMsg({ kind: "success", text: res.message });
    } catch (err) {
      setPwMsg({ kind: "error", text: errMsg(err) });
    }
  }

  return (
    <div className="stack" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="card">
        <div className="card-head">
          <h1 style={{ fontSize: 24 }}>{user.nama}</h1>
          <span className="badge">{user.role}</span>
        </div>
        <dl className="info">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          {user.role === "driver" && (
            <>
              <dt>Kendaraan</dt>
              <dd>
                {user.jenis_kendaraan} · {user.plat_nomor}
              </dd>
            </>
          )}
        </dl>
      </div>

      <form className="card form" onSubmit={saveNama}>
        <h2>Ganti nama</h2>
        <Alert kind={namaMsg?.kind}>{namaMsg?.text}</Alert>
        <Field label="Nama">
          <input className="input" required value={nama} onChange={(e) => setNama(e.target.value)} />
        </Field>
        <button className="btn btn-primary" style={{ justifySelf: "start" }}>
          Simpan
        </button>
      </form>

      <form className="card form" onSubmit={savePw}>
        <h2>Ganti password</h2>
        <Alert kind={pwMsg?.kind}>{pwMsg?.text}</Alert>
        <Field label="Password lama">
          <input className="input" type="password" required autoComplete="current-password" value={pw.lama} onChange={(e) => setPw({ ...pw, lama: e.target.value })} />
        </Field>
        <Field label="Password baru (min. 8 karakter)">
          <input className="input" type="password" required autoComplete="new-password" value={pw.baru} onChange={(e) => setPw({ ...pw, baru: e.target.value })} />
        </Field>
        <button className="btn btn-primary" style={{ justifySelf: "start" }}>
          Ubah password
        </button>
      </form>
    </div>
  );
}
