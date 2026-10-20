"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errMsg, User } from "@/app/lib/api";
import Modal from "../Modal";
import { Alert, Empty, Field } from "../ui";

const label = { user: "penumpang", driver: "driver" } as const;

export default function UsersAdmin({ role }: { role: "user" | "driver" }) {
  const [rows, setRows] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState<User | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await api<User[]>(`/admin/users?role=${role}`));
    } catch (e) {
      setError(errMsg(e));
    }
  }, [role]);

  useEffect(() => {
    setRows(null);
    setError("");
    setNotice("");
    load();
  }, [load]);

  async function hapus(u: User) {
    if (!confirm(`Hapus ${label[role]} "${u.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setError("");
    try {
      await api(`/admin/${role === "driver" ? "drivers" : "users"}/${u.id}`, { method: "DELETE" });
      setNotice(`${u.nama} dihapus`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="stack">
      <h2>Daftar {label[role]}</h2>
      <Alert>{error}</Alert>
      <Alert kind="success">{notice}</Alert>

      {rows && rows.length === 0 && <Empty>Belum ada {label[role]}.</Empty>}

      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                {role === "driver" && <th>Kendaraan</th>}
                <th>No. HP</th>
                <th>Daftar</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.nama}</strong>
                  </td>
                  <td>{u.email}</td>
                  {role === "driver" && (
                    <td>
                      <span className="badge">{u.jenis_kendaraan}</span> {u.plat_nomor}
                    </td>
                  )}
                  <td>{u.no_hp ?? "—"}</td>
                  <td className="muted">{u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "—"}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setTarget(u)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => hapus(u)}>
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

      {target && (
        <EditModal
          user={target}
          onClose={() => setTarget(null)}
          onDone={(msg) => {
            setNotice(msg);
            load();
          }}
        />
      )}
    </div>
  );
}

function EditModal({ user, onClose, onDone }: { user: User; onClose: () => void; onDone: (msg: string) => void }) {
  const [nama, setNama] = useState(user.nama);
  const [pw, setPw] = useState("");
  const [namaErr, setNamaErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");

  async function saveNama(e: FormEvent) {
    e.preventDefault();
    setNamaErr("");
    try {
      await api(`/admin/users/${user.id}/nama`, { method: "PUT", body: { nama } });
      onDone("Nama berhasil diubah");
      onClose();
    } catch (err) {
      setNamaErr(errMsg(err));
    }
  }

  async function savePw(e: FormEvent) {
    e.preventDefault();
    setPwErr("");
    setPwOk("");
    if (pw.length < 8) {
      setPwErr("Password minimal 8 karakter");
      return;
    }
    try {
      await api(`/admin/users/${user.id}/password`, { method: "PUT", body: { password_baru: pw } });
      setPw("");
      setPwOk("Password berhasil direset");
    } catch (err) {
      setPwErr(errMsg(err));
    }
  }

  return (
    <Modal title={`Edit ${user.nama}`} onClose={onClose}>
      <form className="form" onSubmit={saveNama}>
        <Alert>{namaErr}</Alert>
        <Field label="Nama">
          <input className="input" required value={nama} onChange={(e) => setNama(e.target.value)} />
        </Field>
        <button className="btn btn-primary" style={{ justifySelf: "start" }}>
          Simpan nama
        </button>
      </form>

      <hr className="divider" />

      <form className="form" onSubmit={savePw}>
        <Alert>{pwErr}</Alert>
        <Alert kind="success">{pwOk}</Alert>
        <Field label="Password baru (reset)">
          <input className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <button className="btn btn-ghost" style={{ justifySelf: "start" }}>
          Reset password
        </button>
      </form>
    </Modal>
  );
}
