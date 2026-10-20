"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errMsg, Rute } from "@/app/lib/api";
import Modal from "../Modal";
import { Alert, Empty, Field } from "../ui";
import HaltePanel from "./HaltePanel";

const EMPTY = { kode_rute: "", nama_rute: "", asal: "", tujuan: "" };

export default function RuteAdmin() {
  const [rows, setRows] = useState<Rute[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Rute | "new" | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [haltePanel, setHaltePanel] = useState<Rute | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await api<Rute[]>("/rute"));
    } catch (e) {
      setError(errMsg(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openForm(r: Rute | "new") {
    setFormError("");
    setForm(r === "new" ? EMPTY : { kode_rute: r.kode_rute, nama_rute: r.nama_rute, asal: r.asal, tujuan: r.tujuan });
    setEditing(r);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const body = {
        kode_rute: form.kode_rute.trim(),
        nama_rute: form.nama_rute.trim(),
        asal: form.asal.trim(),
        tujuan: form.tujuan.trim(),
      };
      if (editing === "new") {
        await api("/rute", { method: "POST", body });
        setNotice("Rute ditambahkan");
      } else if (editing) {
        await api(`/rute/${editing.id}`, { method: "PUT", body });
        setNotice("Rute diperbarui");
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  async function hapus(r: Rute) {
    if (!confirm(`Hapus rute ${r.kode_rute} (${r.nama_rute})? Semua halte di dalamnya ikut terhapus.`)) return;
    setError("");
    try {
      await api(`/rute/${r.id}`, { method: "DELETE" });
      setNotice("Rute dihapus");
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="stack">
      <div className="row">
        <h2>Daftar rute</h2>
        <button className="btn btn-primary spacer" onClick={() => openForm("new")}>
          + Tambah rute
        </button>
      </div>

      <Alert>{error}</Alert>
      <Alert kind="success">{notice}</Alert>

      {rows && rows.length === 0 && <Empty>Belum ada rute. Tambahkan yang pertama.</Empty>}

      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Asal → Tujuan</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="badge">{r.kode_rute}</span>
                  </td>
                  <td>{r.nama_rute}</td>
                  <td>
                    {r.asal} <span className="arrow">→</span> {r.tujuan}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setHaltePanel(r)}>
                        Halte
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openForm(r)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => hapus(r)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Tambah rute" : "Edit rute"} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={submit}>
            <Alert>{formError}</Alert>
            <div className="form-row">
              <Field label="Kode rute">
                <input className="input" required value={form.kode_rute} onChange={set("kode_rute")} placeholder="K1" />
              </Field>
              <Field label="Nama rute">
                <input className="input" required value={form.nama_rute} onChange={set("nama_rute")} placeholder="Koridor 1" />
              </Field>
            </div>
            <div className="form-row">
              <Field label="Asal">
                <input className="input" required value={form.asal} onChange={set("asal")} />
              </Field>
              <Field label="Tujuan">
                <input className="input" required value={form.tujuan} onChange={set("tujuan")} />
              </Field>
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </form>
        </Modal>
      )}

      {haltePanel && <HaltePanel rute={haltePanel} onClose={() => setHaltePanel(null)} />}
    </div>
  );
}
