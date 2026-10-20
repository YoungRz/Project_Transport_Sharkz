"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./authprovider";

export default function Header() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const item = (href: string, label: string) => (
    <Link href={href} aria-current={pathname === href ? "page" : undefined}>
      {label}
    </Link>
  );

  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">TU</span>
          Transportasi Umum
        </Link>
        <nav className="nav" aria-label="Menu utama">
          {item("/", "Rute")}
          {ready && user?.role === "admin" && item("/admin", "Panel admin")}
          {ready && user && item("/account", "Akun saya")}
          {ready && !user && item("/login", "Masuk")}
          {ready && !user && item("/register", "Daftar")}
          {ready && user && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Keluar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}