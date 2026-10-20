"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/authprovider";
import { errMsg } from "./lib/api";
import Field from "./components/field";
import Notice from "./components/notice";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel panel-narrow">
      <h1 style={{ fontSize: "2.4rem" }}>Masuk</h1>
      <p className="lede">Penumpang, pengemudi, dan admin masuk lewat halaman yang sama.</p>
      <form onSubmit={submit} className="stack-top">
        {error && <Notice kind="bad">{error}</Notice>}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <p className="hint stack-top">
        Belum punya akun? <Link href="/register">Daftar sekarang</Link>
      </p>
    </div>
  );
}