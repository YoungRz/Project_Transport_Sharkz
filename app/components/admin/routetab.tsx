"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errMsg } from "../../lib/api";
import type { Msg, Rute } from "../../lib/api";
import Field from "../field";
import Notice from "../notice";
import RouteBadge from "../routebadge";

const KOSONG = { kode_rute: "", nama_rute: "", asal: "", tujuan: "" };

export default function RoutesTab() {
  const [list, setList] = useState<Rute[] | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setList(await api<Rute[]>("/rute"));
    } catch (e) {
      setMsg({ kind: "bad", text: errMsg(e) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const ubah = (k: keyof typeof KOSONG) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  function mulaiEdit(r: Rute) {
    setEditId(r.id);
    setForm({ kode_rute: r.kode_rute, nama_rute: r.nama_rute, asal: r.asal, tujuan: r.tujuan });
    setMsg(null);
  }

  function batal() {
    setEditId(null);
    setForm(KOSONG);
  }

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const body = {
        kode_rute: form.kode_rute.trim(),
        nama_rute: form.nama_rute.trim(),
        asal: form.asal.trim(),
        tujuan: form.tujuan.trim(),
      };
      if (editId) {
        await api(`/rute/${editId}`, { method: "PUT", body });
        setMsg({ kind: "ok", text: "Rute diperbarui." });
      } else {
        await api("/rute", { method: "POST", body });
        setMsg({ kind: "ok", text: "Rute ditambahkan." });
      }
      batal();
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  }

  async function hapus(r: Rute) {
    if (!window.confirm(`Hapus rute ${r.kode_rute} (${r.nama_rute})? Semua halte di rute ini ikut terhapus.`)) return;
    setMsg(null);
    try {
      await api(`/rute/${r.id}`, { method: "DELETE" });
      if (editId === r.id) batal();
      setMsg({ kind: "ok", text: `Rute ${r.kode_rute} dihapus.` });
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    }
  }

  return (
    <>
      <section className="panel">
        <h2>{editId ? "Ubah rute" : "Tambah rute"}</h2>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        <form onSubmit={simpan}>
          <div className="form-grid">
            <Field
              id="r-kode"
              label="Kode rute"
              required
              maxLength={10}
              placeholder="K1"
              value={form.kode_rute}
              onChange={(e) => ubah("kode_rute")(e.target.value)}
            />
            <Field
              id="r-nama"
              label="Nama rute"
              required
              placeholder="Koridor 1"
              value={form.nama_rute}
              onChange={(e) => ubah("nama_rute")(e.target.value)}
            />
            <Field
              id="r-asal"
              label="Asal"
              required
              value={form.asal}
              onChange={(e) => ubah("asal")(e.target.value)}
            />
            <Field
              id="r-tujuan"
              label="Tujuan"
              required
              value={form.tujuan}
              onChange={(e) => ubah("tujuan")(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Menyimpan…" : editId ? "Simpan perubahan" : "Tambah rute"}
            </button>
            {editId && (
              <button className="btn btn-ghost" type="button" onClick={batal}>
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <h2 className="stack-top">Semua rute</h2>
      {!list && <p className="hint stack-top">Memuat rute…</p>}
      {list && list.length === 0 && (
        <div className="empty stack-top">Belum ada rute. Isi formulir di atas untuk menambahkan yang pertama.</div>
      )}
      {list && list.length > 0 && (
        <div className="table-wrap stack-top">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Asal – tujuan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <RouteBadge kode={r.kode_rute} />
                  </td>
                  <td>{r.nama_rute}</td>
                  <td>
                    {r.asal} – {r.tujuan}
                  </td>
                  <td>
                    <div className="actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => mulaiEdit(r)}>
                        Ubah
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => hapus(r)}>
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