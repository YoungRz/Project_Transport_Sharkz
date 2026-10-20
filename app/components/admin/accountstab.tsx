"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errMsg } from "../../lib/api";
import type { Akun, Msg } from "../../lib/api";
import Field from "../Field";
import Notice from "../Notice";

type Filter = "" | "user" | "driver";

export default function AccountsTab() {
  const [filter, setFilter] = useState<Filter>("");
  const [list, setList] = useState<Akun[] | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [namaBaru, setNamaBaru] = useState("");
  const [passBaru, setPassBaru] = useState("");

  const load = useCallback(async () => {
    try {
      setList(await api<Akun[]>(`/admin/users${filter ? `?role=${filter}` : ""}`));
    } catch (e) {
      setMsg({ kind: "bad", text: errMsg(e) });
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  function bukaEditor(a: Akun) {
    if (editId === a.id) {
      setEditId(null);
      return;
    }
    setEditId(a.id);
    setNamaBaru(a.nama);
    setPassBaru("");
    setMsg(null);
  }

  async function simpanNama(e: FormEvent, a: Akun) {
    e.preventDefault();
    setMsg(null);
    try {
      await api(`/admin/users/${a.id}/nama`, { method: "PUT", body: { nama: namaBaru } });
      setMsg({ kind: "ok", text: `Nama akun ${a.email} diubah.` });
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    }
  }

  async function simpanPassword(e: FormEvent, a: Akun) {
    e.preventDefault();
    setMsg(null);
    try {
      await api(`/admin/users/${a.id}/password`, { method: "PUT", body: { password_baru: passBaru } });
      setPassBaru("");
      setMsg({ kind: "ok", text: `Password akun ${a.email} diubah.` });
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    }
  }

  async function hapus(a: Akun) {
    if (!window.confirm(`Hapus akun ${a.nama} (${a.email}) secara permanen?`)) return;
    setMsg(null);
    try {
      await api(a.role === "driver" ? `/admin/drivers/${a.id}` : `/admin/users/${a.id}`, {
        method: "DELETE",
      });
      if (editId === a.id) setEditId(null);
      setMsg({ kind: "ok", text: `Akun ${a.email} dihapus.` });
      await load();
    } catch (err) {
      setMsg({ kind: "bad", text: errMsg(err) });
    }
  }

  return (
    <>
      <div className="toolbar">
        <h2>Akun pengguna</h2>
        <div className="field">
          <label htmlFor="a-filter">Tampilkan</label>
          <select
            id="a-filter"
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
          >
            <option value="">Penumpang dan pengemudi</option>
            <option value="user">Penumpang saja</option>
            <option value="driver">Pengemudi saja</option>
          </select>
        </div>
      </div>

      <p className="hint">Akun admin tidak ditampilkan dan tidak bisa diubah dari sini.</p>

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {!list && <p className="hint">Memuat akun…</p>}
      {list && list.length === 0 && <div className="empty">Belum ada akun yang cocok.</div>}

      {list && list.length > 0 && (
        <div className="table-wrap stack-top">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Kendaraan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <Fragment key={a.id}>
                  <tr>
                    <td>{a.nama}</td>
                    <td>{a.email}</td>
                    <td>
                      <span className="chip">{a.role === "driver" ? "Pengemudi" : "Penumpang"}</span>
                    </td>
                    <td>
                      {a.role === "driver"
                        ? `${a.jenis_kendaraan === "mobil" ? "Mobil" : "Motor"}, ${a.plat_nomor ?? "-"}`
                        : "-"}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-expanded={editId === a.id}
                          onClick={() => bukaEditor(a)}
                        >
                          {editId === a.id ? "Tutup" : "Ubah"}
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => hapus(a)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editId === a.id && (
                    <tr>
                      <td colSpan={5} className="inline-edit">
                        <div className="form-grid">
                          <form onSubmit={(e) => simpanNama(e, a)}>
                            <Field
                              id={`nama-${a.id}`}
                              label="Nama baru"
                              required
                              value={namaBaru}
                              onChange={(e) => setNamaBaru(e.target.value)}
                            />
                            <button className="btn btn-sm" type="submit">
                              Simpan nama
                            </button>
                          </form>
                          <form onSubmit={(e) => simpanPassword(e, a)}>
                            <Field
                              id={`pass-${a.id}`}
                              label="Password baru"
                              type="password"
                              required
                              minLength={4}
                              autoComplete="new-password"
                              hint="Minimal 4 karakter."
                              value={passBaru}
                              onChange={(e) => setPassBaru(e.target.value)}
                            />
                            <button className="btn btn-sm" type="submit">
                              Simpan password
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}