"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { api, errMsg } from "./lib/api";
import Field from "../components/field";
import Notice from "../../components/notice";

type Jenis = "user" | "driver";

const AWAL = {
  nama: "",
  email: "",
  password: "",
  no_hp: "",
  jenis_kendaraan: "motor",
  plat_nomor: "",
};

export default function RegisterPage() {
  const [jenis, setJenis] = useState<Jenis>("user");
  const [f, setF] = useState(AWAL);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof AWAL) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSukses(false);
    setBusy(true);
    try {
      const dasar = {
        nama: f.nama.trim(),
        email: f.email.trim(),
        password: f.password,
        no_hp: f.no_hp.trim() || undefined,
      };
      if (jenis === "user") {
        await api("/auth/register", { method: "POST", body: dasar });
      } else {
        await api("/auth/register-driver", {
          method: "POST",
          body: {
            ...dasar,
            jenis_kendaraan: f.jenis_kendaraan,
            plat_nomor: f.plat_nomor.trim(),
          },
        });
      }
      setSukses(true);
      setF(AWAL);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel panel-narrow">
      <h1 style={{ fontSize: "2.4rem" }}>Daftar</h1>

      <div className="tabs stack-top" role="tablist" aria-label="Jenis akun">
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={jenis === "user"}
          onClick={() => setJenis("user")}
        >
          Penumpang
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={jenis === "driver"}
          onClick={() => setJenis("driver")}
        >
          Pengemudi
        </button>
      </div>

      {sukses && (
        <Notice kind="ok">
          Akun berhasil dibuat. <Link href="/login">Masuk sekarang</Link>
        </Notice>
      )}
      {error && <Notice kind="bad">{error}</Notice>}

      <form onSubmit={submit}>
        <Field id="nama" label="Nama" required autoComplete="name" value={f.nama} onChange={set("nama")} />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          required
          minLength={4}
          autoComplete="new-password"
          hint="Minimal 4 karakter."
          value={f.password}
          onChange={set("password")}
        />
        <Field
          id="no_hp"
          label="Nomor HP (boleh dikosongkan)"
          type="tel"
          autoComplete="tel"
          value={f.no_hp}
          onChange={set("no_hp")}
        />

        {jenis === "driver" && (
          <>
            <div className="field">
              <label htmlFor="jenis_kendaraan">Kendaraan</label>
              <select
                id="jenis_kendaraan"
                className="input"
                value={f.jenis_kendaraan}
                onChange={set("jenis_kendaraan")}
              >
                <option value="motor">Motor</option>
                <option value="mobil">Mobil</option>
              </select>
            </div>
            <Field
              id="plat_nomor"
              label="Plat nomor"
              required
              placeholder="B 1234 ABC"
              value={f.plat_nomor}
              onChange={set("plat_nomor")}
            />
          </>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Memproses…" : jenis === "user" ? "Buat akun penumpang" : "Buat akun pengemudi"}
        </button>
      </form>

      <p className="hint stack-top">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}