"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/authprovider";
import { api, errMsg } from "./lib/api";
import type { Msg, Role } from "./lib/api";
import Field from "./components/field";
import Notice from "./components/notice";

const PERAN: Record<Role, string> = {
  admin: "Admin",
  user: "Penumpang",
  driver: "Pengemudi",
};

export default function AccountPage() {
  const { user, ready, logout, updateUser } = useAuth();
  const router = useRouter();

  const [nama, setNama] = useState<string | null>(null);
  const [namaMsg, setNamaMsg] = useState<Msg>(null);
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [passMsg, setPassMsg] = useState<Msg>(null);
  const [hapusMsg, setHapusMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return <p className="hint">Memuat…</p>;

  const namaInput = nama ?? user.nama;

  async function simpanNama(e: FormEvent) {
    e.preventDefault();
    setNamaMsg(null);
    setBusy("nama");
    try {
      const res = await api<{ nama: string }>("/users/me", { method: "PUT", body: { nama: namaInput } });
      updateUser({ nama: res.nama });
      setNama(null);
      setNamaMsg({ kind: "ok", text: "Nama berhasil diubah." });
    } catch (err) {
      setNamaMsg({ kind: "bad", text: errMsg(err) });
    } finally {
      setBusy("");
    }
  }

  async function simpanPassword(e: FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    if (baru !== ulang) {
      setPassMsg({ kind: "bad", text: "Password baru dan pengulangannya tidak sama." });
      return;
    }
    setBusy("password");
    try {
      await api("/users/me/password", {
        method: "PUT",
        body: { password_lama: lama, password_baru: baru },
      });
      setLama("");
      setBaru("");
      setUlang("");
      setPassMsg({ kind: "ok", text: "Password berhasil diubah." });
    } catch (err) {
      setPassMsg({ kind: "bad", text: errMsg(err) });
    } finally {
      setBusy("");
    }
  }

  async function hapusAkun() {
    if (!window.confirm("Hapus akunmu secara permanen? Tindakan ini tidak bisa dibatalkan.")) return;
    setHapusMsg(null);
    setBusy("hapus");
    try {
      await api("/users/me", { method: "DELETE" });
      logout();
      router.push("/");
    } catch (err) {
      setHapusMsg({ kind: "bad", text: errMsg(err) });
      setBusy("");
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Akun saya</h1>
      </div>

      <section className="panel">
        <h2>Data akun</h2>
        <dl className="facts">
          <dt>Nama</dt>
          <dd>{user.nama}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Peran</dt>
          <dd>
            <span className={user.role === "admin" ? "chip chip-admin" : "chip"}>{PERAN[user.role]}</span>
          </dd>
          {user.role === "driver" && (
            <>
              <dt>Kendaraan</dt>
              <dd>
                {user.jenis_kendaraan === "mobil" ? "Mobil" : "Motor"}, {user.plat_nomor}
              </dd>
            </>
          )}
        </dl>
      </section>

      <section className="panel panel-narrow">
        <h2>Ganti nama</h2>
        {namaMsg && <Notice kind={namaMsg.kind}>{namaMsg.text}</Notice>}
        <form onSubmit={simpanNama}>
          <Field
            id="nama"
            label="Nama"
            required
            value={namaInput}
            onChange={(e) => setNama(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy === "nama"}>
            {busy === "nama" ? "Menyimpan…" : "Simpan nama"}
          </button>
        </form>
      </section>

      <section className="panel panel-narrow">
        <h2>Ganti password</h2>
        {passMsg && <Notice kind={passMsg.kind}>{passMsg.text}</Notice>}
        <form onSubmit={simpanPassword}>
          <Field
            id="lama"
            label="Password lama"
            type="password"
            required
            autoComplete="current-password"
            value={lama}
            onChange={(e) => setLama(e.target.value)}
          />
          <Field
            id="baru"
            label="Password baru"
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
            hint="Minimal 4 karakter."
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
          />
          <Field
            id="ulang"
            label="Ulangi password baru"
            type="password"
            required
            autoComplete="new-password"
            value={ulang}
            onChange={(e) => setUlang(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy === "password"}>
            {busy === "password" ? "Menyimpan…" : "Simpan password"}
          </button>
        </form>
      </section>

      {user.role !== "admin" && (
        <section className="panel panel-narrow">
          <h2>Hapus akun</h2>
          <p className="hint">Akun dan datanya dihapus permanen. Kamu akan langsung keluar.</p>
          {hapusMsg && <Notice kind={hapusMsg.kind}>{hapusMsg.text}</Notice>}
          <button
            type="button"
            className="btn btn-danger stack-top"
            onClick={hapusAkun}
            disabled={busy === "hapus"}
          >
            {busy === "hapus" ? "Menghapus…" : "Hapus akun saya"}
          </button>
        </section>
      )}
    </>
  );
}