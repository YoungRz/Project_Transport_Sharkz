import { Router, Response } from "express";
import { pool } from "../db/db";
import { verifyToken, AuthRequest } from "../Middleware/Authmiddleware";

const router = Router();

// Hapus akun sendiri 
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