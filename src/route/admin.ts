import { Router } from "express";
import { pool } from "../db/db";
import { adminOnly } from "../Middleware/AdminMiddleware";

const router = Router();

// Semua route di file ini khusus admin
router.use(adminOnly);

// Lihat akun. Filter: GET /admin/users?role=user  atau  ?role=driver
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

export default router;