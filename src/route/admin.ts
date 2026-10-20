import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/db";
import { adminOnly } from "../Middleware/AdminMiddleware";
const router = Router();

router.use(adminOnly);

router.get("/users", async (req, res) => {
  const { role } = req.query;
  const base =
    "SELECT id, nama, email, role, jenis_kendaraan, plat_nomor, no_hp, created_at FROM users WHERE role <> 'admin'";
  const [rows] =
    role === "user" || role === "driver"
      ? await pool.query(base + " AND role = ?", [role])
      : await pool.query(base);
  res.json(rows);
});

// Hapus user (penumpang)
router.delete("/users/:id", async (req, res) => {
  const [result]: any = await pool.query(
    "DELETE FROM users WHERE id = ? AND role = 'user'",
    [req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "User tidak ditemukan" });
    return;
  }
  res.json({ message: "User dihapus" });
});

// Hapus driver
router.delete("/drivers/:id", async (req, res) => {
  const [result]: any = await pool.query(
    "DELETE FROM users WHERE id = ? AND role = 'driver'",
    [req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Driver tidak ditemukan" });
    return;
  }
  res.json({ message: "Driver dihapus" });
});
// Cari akun target, dipakai untuk cek role sebelum mengubah
async function cariTarget(id: string) {
  const [rows]: any = await pool.query("SELECT id, role FROM users WHERE id = ?", [id]);
  return rows[0] as { id: number; role: string } | undefined;
}

// Admin ganti nama user atau driver
router.put("/users/:id/nama", async (req: Request, res: Response) => {
  const { nama } = req.body ?? {};
  if (typeof nama !== "string" || !nama.trim()) {
    res.status(400).json({ message: "nama wajib diisi" });
    return;
  }

  const target = await cariTarget(String(req.params.id));
  if (!target) {
    res.status(404).json({ message: "Akun tidak ditemukan" });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ message: "Tidak boleh mengubah akun admin" });
    return;
  }

  await pool.query("UPDATE users SET nama = ? WHERE id = ?", [nama.trim(), target.id]);
  res.json({ message: "Nama berhasil diubah", nama: nama.trim() });
});

// Admin ganti password user atau driver
router.put("/users/:id/password", async (req: Request, res: Response) => {
  const { password_baru } = req.body ?? {};
  if (typeof password_baru !== "string" || password_baru.length < 4) {
    res.status(400).json({ message: "password_baru wajib diisi (minimal 4 karakter)" });
    return;
  }

  const target = await cariTarget(String(req.params.id));
  if (!target) {
    res.status(404).json({ message: "Akun tidak ditemukan" });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ message: "Tidak boleh mengubah akun admin" });
    return;
  }

  const hash = await bcrypt.hash(password_baru, 10);
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, target.id]);
  res.json({ message: "Password berhasil diubah" });
});

export default router;