"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errMsg, Halte, Rute } from "@/app/lib/api";
import Modal from "../Modal";
import { Alert, Empty, Field } from "../ui";

export default function HaltePanel({ rute, onClose }: { rute: Rute; onClose: () => void }) {
  const [rows, setRows] = useState<Halte[] | null>(null);
  const [editing, setEditing] = useState<Halte | null>(null);
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [urutan, setUrutan] = useState("1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<Halte[]>(`/halte?rute_id=${rute.id}`);
      setRows(data);
      setUrutan(String(Math.max(0, ...data.map((h) => h.urutan)) + 1));
    } catch (e) {
      setError(errMsg(e));
    }
  }, [rute.id]);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setEditing(null);
    setNama("");
    setAlamat("");
  }

  function startEdit(h: Halte) {
    setEditing(h);
    setNama(h.nama_halte);
    setAlamat(h.alamat ?? "");
    setUrutan(String(h.urutan));
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const n = Number(urutan);
    if (!Number.isInteger(n) || n < 1) {
      setError("Urutan harus bilangan bulat ≥ 1");
      return;
    }
    setSaving(true);
    try {
      const body = { rute_id: rute.id, nama_halte: nama.trim(), alamat: alamat.trim() || null, urutan: n };
      if (editing) await api(`/halte/${editing.id}`, { method: "PUT", body });
      else await api("/halte", { method: "POST", body });
      reset();
      await load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  async function hapus(h: Halte) {
    if (!confirm(`Hapus ${h.nama_halte}?`)) return;
    setError("");
    try {
      await api(`/halte/${h.id}`, { method: "DELETE" });
      if (editing?.id === h.id) reset();
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <Modal wide title={`Halte · ${rute.kode_rute} ${rute.nama_rute}`} onClose={onClose}>
      <Alert>{error}</Alert>

      {rows && rows.length === 0 && <Empty>Belum ada halte di rute ini.</Empty>}
      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama halte</th>
                <th>Alamat</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td>
                    <span className="badge">{h.urutan}</span>
                  </td>
                  <td>{h.nama_halte}</td>
                  <td className="muted">{h.alamat ?? "—"}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(h)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => hapus(h)}>
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

      <hr className="divider" />

      <form className="form" onSubmit={submit}>
        <h3>{editing ? `Edit: ${editing.nama_halte}` : "Tambah halte"}</h3>
        <div className="form-row">
          <Field label="Nama halte">
            <input className="input" required value={nama} onChange={(e) => setNama(e.target.value)} />
          </Field>
          <Field label="Urutan">
            <input className="input" type="number" min={1} required value={urutan} onChange={(e) => setUrutan(e.target.value)} />
          </Field>
        </div>
        <Field label="Alamat">
          <input className="input" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
        </Field>
        <div className="row">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah"}
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Batal edit
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
