"use client";

import { useState } from "react";
import { useGuard } from "@/app/lib/auth";
import RuteAdmin from "@/app/components/admin/RuteAdmin";
import UsersAdmin from "@/app/components/admin/UsersAdmin";

const TABS = [
  { id: "rute", label: "Rute & Halte" },
  { id: "user", label: "Penumpang" },
  { id: "driver", label: "Driver" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const { ok } = useGuard(["admin"]);
  const [tab, setTab] = useState<TabId>("rute");

  if (!ok) return null;

  return (
    <div className="stack">
      <div>
        <h1 style={{ fontSize: 28 }}>Panel Admin</h1>
        <p className="muted">Kelola rute, halte, penumpang, dan driver.</p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rute" && <RuteAdmin />}
      {tab === "user" && <UsersAdmin role="user" />}
      {tab === "driver" && <UsersAdmin role="driver" />}
    </div>
  );
}
