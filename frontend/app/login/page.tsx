"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import { errMsg } from "@/app/lib/api";
import { Alert, Field } from "@/app/components/ui";
import PasswordInput from "@/app/components/PasswordInput";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      router.replace(u.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Masuk</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Penumpang, driver, dan admin masuk lewat sini.
      </p>
      <form className="form" onSubmit={onSubmit}>
        <Alert>{error}</Alert>
        <Field label="Email">
          <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <PasswordInput required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
        Belum punya akun? <Link href="/register" style={{ fontWeight: 700 }}>Daftar</Link>
      </p>
    </div>
  );
}
