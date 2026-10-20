"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import { api, errMsg } from "@/app/lib/api";
import { Alert, Field } from "@/app/components/ui";
import PasswordInput from "@/app/components/PasswordInput";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [kind, setKind] = useState<"user" | "driver">("user");
  const [f, setF] = useState({ nama: "", email: "", password: "", no_hp: "", jenis_kendaraan: "motor", plat_nomor: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (f.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      const base = { nama: f.nama.trim(), email: f.email.trim(), password: f.password, no_hp: f.no_hp.trim() || null };
      if (kind === "user") {
        await api("/auth/register", { method: "POST", body: base });
      } else {
        await api("/auth/register-driver", {
          method: "POST",
          body: { ...base, jenis_kendaraan: f.jenis_kendaraan, plat_nomor: f.plat_nomor.trim().toUpperCase() },
        });
      }
      await login(base.email, f.password);
      router.replace("/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Buat akun</h1>
      <div className="tabs" style={{ margin: "14px 0 18px" }} role="tablist">
        <button type="button" className={`tab${kind === "user" ? " active" : ""}`} onClick={() => setKind("user")}>
          Penumpang
        </button>
        <button type="button" className={`tab${kind === "driver" ? " active" : ""}`} onClick={() => setKind("driver")}>
          Driver
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <Alert>{error}</Alert>
        <Field label="Nama lengkap">
          <input className="input" required value={f.nama} onChange={set("nama")} />
        </Field>
        <Field label="Email">
          <input className="input" type="email" required autoComplete="email" value={f.email} onChange={set("email")} />
        </Field>
        <Field label="Password (min. 8 karakter)">
          <PasswordInput required autoComplete="new-password" value={f.password} onChange={set("password")} />
        </Field>
        <Field label="No. HP (opsional)">
          <input className="input" type="tel" value={f.no_hp} onChange={set("no_hp")} />
        </Field>

        {kind === "driver" && (
          <div className="form-row">
            <Field label="Jenis kendaraan">
              <select className="input" value={f.jenis_kendaraan} onChange={set("jenis_kendaraan")}>
                <option value="motor">Motor</option>
                <option value="mobil">Mobil</option>
              </select>
            </Field>
            <Field label="Plat nomor">
              <input className="input" required placeholder="B 1234 ABC" value={f.plat_nomor} onChange={set("plat_nomor")} />
            </Field>
          </div>
        )}

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
        Sudah punya akun? <Link href="/login" style={{ fontWeight: 700 }}>Masuk</Link>
      </p>
    </div>
  );
}
