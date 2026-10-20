import type { ReactNode } from "react";

export default function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "ok" | "bad";
  children: ReactNode;
}) {
  const cls = kind === "ok" ? "notice notice-ok" : kind === "bad" ? "notice notice-bad" : "notice";
  return (
    <div className={cls} role={kind === "bad" ? "alert" : "status"}>
      {children}
    </div>
  );
}