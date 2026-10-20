"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errMsg } from "../../lib/api";
import type { Halte, Msg, Rute } from "../../lib/api";
import Field from "../field";
import Notice from "../notice";
import RouteBadge from "../routebadge";

const KOSONG = { rute_id: "", nama_halte: "", alamat: "", urutan: "" };

export default function StopsTab() {
  const [rute, setRute] = useState<Rute[]>([]);
  const [filter, setFilter] = useState("");
  const [list, setList] = useState<Halte[] | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Rute[]>("/rute")
      .then(setRute)
      .catch((e) => setMsg({ kind: "bad", text: errMsg(e) }));
  }, []);

  const load = useCallback(async () => {
    try {
      setList(await api<Halte[]>(`/halte${filter ? `?rute_id=${filter}` : ""}`));
    } catch (e) {
      setMsg({ kind: "bad", text: errMsg(e) });
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  // Rute di formulir: pilihan sendiri, kalau belum dipilih ikut filter di atas tabel
  const ruteForm = form.rute_id || filter;
  const kodeRute = (id: number) => rute.find((r) => r.id === id)?.kode_rute ?? `#${id}`;

  function mulaiEdit(h: Halte) {
    setEditId(h.id);
    setForm({
      rute_id: String(h.rute_id),
      nama_halte: h.nama_halte,
      alamat: h.alamat ?? "",
      urutan: String(h.urutan),
    });
    setMsg(null);
  }

  function batal() {
    setEditId(null);
    setForm({ ...KOSONG, rute_id: filter });
  }

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!ruteForm) {
      setMsg({ kind: "bad", text: "Pilih rute untuk halte ini dulu." });
      return;
    }
    setBusy(true);
    try {
      const urutan = Number(form.urutan);
      const body = {
        rute_id: Number(ruteForm),
        nama_halte: form.nama_halte.trim(),
        alamat: form.alamat.trim() || undefined,
        urutan,
      };
      if (editId) {
        await api(`/halte/${editId}`, { method: "PUT", body });
        setMsg({ kind: "ok", text: "Halte diperbarui." });
        setEditId(null);
        setForm({ ...KOSONG, rute_id: ruteForm });
      } else {
        await api("/halte", { method: "POST", body });
        setMsg({ kind: "ok", text: "Halte ditambahkan." });
        // Tetap di rute yang sama dan siapkan nomor urut berikutnya, supaya input beruntun lebih cepat
        setForm({ ...KOSONG, rute_id: ruteForm, urutan: String(urutan + 1) });
      }
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  }

  async function hapus(h: Halte) {
    if (!window.confirm(`Hapus halte "${h.nama_halte}"?`)) return;
    setMsg(null);
    try {
      await api(`/halte/${h.id}`, { method: "DELETE" });
      if (editId === h.id) batal();
      setMsg({ kind: "ok", text: "Halte dihapus." });
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    }
  }

  return (
    <>
      <section className="panel">
        <h2>{editId ? "Ubah halte" : "Tambah halte"}</h2>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        {rute.length === 0 ? (
          <p className="hint">Belum ada rute. Tambahkan rute dulu di tab Rute.</p>
        ) : (
          <form onSubmit={simpan}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="h-rute">Rute</label>
                <select
                  id="h-rute"
                  className="input"
                  required
                  value={ruteForm}
                  onChange={(e) => setForm((f) => ({ ...f, rute_id: e.target.value }))}
                >
                  <option value="" disabled>
                    Pilih rute
                  </option>
                  {rute.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.kode_rute} – {r.nama_rute}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                id="h-nama"
                label="Nama halte"
                required
                value={form.nama_halte}
                onChange={(e) => setForm((f) => ({ ...f, nama_halte: e.target.value }))}
              />
              <Field
                id="h-alamat"
                label="Alamat (boleh dikosongkan)"
                value={form.alamat}
                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
              />
              <Field
                id="h-urutan"
                label="Urutan di rute"
                type="number"
                min={1}
                required
                hint="1 untuk halte pertama."
                value={form.urutan}
                onChange={(e) => setForm((f) => ({ ...f, urutan: e.target.value }))}
              />
            </div>
            <div className="actions">
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Menyimpan…" : editId ? "Simpan perubahan" : "Tambah halte"}
              </button>
              {editId && (
                <button className="btn btn-ghost" type="button" onClick={batal}>
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      <div className="toolbar stack-top">
        <h2>Semua halte</h2>
        <div className="field">
          <label htmlFor="h-filter">Tampilkan rute</label>
          <select
            id="h-filter"
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua rute</option>
            {rute.map((r) => (
              <option key={r.id} value={r.id}>
                {r.kode_rute} – {r.nama_rute}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!list && <p className="hint">Memuat halte…</p>}
      {list && list.length === 0 && (
        <div className="empty">Belum ada halte{filter ? " di rute ini" : ""}. Isi formulir di atas untuk menambahkan.</div>
      )}
      {list && list.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rute</th>
                <th>Urutan</th>
                <th>Nama halte</th>
                <th>Alamat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((h) => (
                <tr key={h.id}>
                  <td>
                    <RouteBadge kode={kodeRute(h.rute_id)} />
                  </td>
                  <td>{h.urutan}</td>
                  <td>{h.nama_halte}</td>
                  <td>{h.alamat ?? "-"}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => mulaiEdit(h)}>
                        Ubah
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => hapus(h)}>
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
    </>
  );
}