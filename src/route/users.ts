import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { AuthRequest, verifyToken } from "../Middleware/Authmiddleware";
import { pool } from "../db/db";

const router = Router();

// Ganti nama sendiri
router.put("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  const { nama } = req.body ?? {};
  if (typeof nama !== "string" || !nama.trim()) {
    res.status(400).json({ message: "nama wajib diisi" });
    return;
  }

  const [result]: any = await pool.query(
    "UPDATE users SET nama = ? WHERE id = ?",
    [nama.trim(), req.user!.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Akun tidak ditemukan" });
    return;
  }
  res.json({ message: "Nama berhasil diubah", nama: nama.trim() });
});

// Ganti password sendiri
router.put("/me/password", verifyToken, async (req: AuthRequest, res: Response) => {
  const { password_lama, password_baru } = req.body ?? {};
  if (
    typeof password_lama !== "string" ||
    typeof password_baru !== "string" ||
    password_baru.length < 4
  ) {
    res.status(400).json({
      message: "password_lama dan password_baru wajib diisi (minimal 4 karakter)",
    });
    return;
  }

  const [rows]: any = await pool.query(
    "SELECT password FROM users WHERE id = ?",
    [req.user!.id]
  );
  if (rows.length === 0) {
    res.status(404).json({ message: "Akun tidak ditemukan" });
    return;
  }

  const cocok = await bcrypt.compare(password_lama, rows[0].password);
  if (!cocok) {
    res.status(400).json({ message: "Password lama salah" });
    return;
  }

  const hash = await bcrypt.hash(password_baru, 10);
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user!.id]);
  res.json({ message: "Password berhasil diubah" });
});

router.delete("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role === "admin") {
    res.status(403).json({ message: "Akun admin tidak bisa dihapus lewat API" });
    return;
  }

  const [result]: any = await pool.query(
    "DELETE FROM users WHERE id = ? AND role <> 'admin'",
    [req.user.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Akun tidak ditemukan" });
    return;
  }
  res.json({ message: "Akun kamu berhasil dihapus" });
});

export default router;