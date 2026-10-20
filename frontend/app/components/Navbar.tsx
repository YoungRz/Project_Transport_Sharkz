"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import Modal from "./Modal";

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);

  const cls = (href: string) => `link${pathname === href ? " active" : ""}`;

  function doLogout() {
    logout();
    setConfirmOut(false);
    router.push("/");
  }

  return (
    <>
      <header className="nav">
        <nav className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-dot">🚌</span> Transport Kota
          </Link>

          <Link href="/" className={cls("/")}>
            Rute
          </Link>

          {ready && user?.role === "user" && (
            <Link href="/pesan" className={cls("/pesan")}>
              Pesan
            </Link>
          )}
          {ready && user?.role === "admin" && (
            <Link href="/admin" className={cls("/admin")}>
              Admin
            </Link>
          )}
          {ready && user && (
            <Link href="/profil" className={cls("/profil")}>
              Profil
            </Link>
          )}

          {ready && !user && (
            <>
              <Link href="/login" className={cls("/login")}>
                Masuk
              </Link>
              <Link href="/register" className="btn btn-ghost btn-sm" style={{ background: "var(--c1)" }}>
                Daftar
              </Link>
            </>
          )}

          {ready && user && (
            <>
              <span className="who">Halo, {user.nama.split(" ")[0]}</span>
              <button className="link" onClick={() => setConfirmOut(true)}>
                Keluar
              </button>
            </>
          )}
        </nav>
      </header>

      {confirmOut && (
        <Modal title="Yakin ingin logout?" onClose={() => setConfirmOut(false)}>
          <p className="muted" style={{ marginBottom: 20 }}>
            Kamu akan keluar dari akun <strong>{user?.nama}</strong>. Kamu bisa masuk lagi kapan saja.
          </p>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setConfirmOut(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={doLogout} autoFocus>
              Ya, keluar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
