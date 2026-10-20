"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/authprovider";
import RoutesTab from "./components/admin/routetab";
import StopsTab from "./components/admin/stoptab";
import AccountsTab from "./components/admin/accountstab";

type Tab = "rute" | "halte" | "akun";

const TABS: { id: Tab; label: string }[] = [
  { id: "rute", label: "Rute" },
  { id: "halte", label: "Halte" },
  { id: "akun", label: "Akun" },
];

export default function AdminPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("rute");

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) router.replace(user ? "/" : "/login");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") return <p className="hint">Memeriksa akses…</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Panel admin</h1>
          <p className="lede">Kelola rute, halte, dan akun pengguna.</p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Bagian panel admin">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rute" && <RoutesTab />}
      {tab === "halte" && <StopsTab />}
      {tab === "akun" && <AccountsTab />}
    </>
  );
}