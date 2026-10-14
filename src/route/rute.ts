import { Router, Request, Response } from "express";
import { pool } from "../db/db";
import { adminOnly } from "../Middleware/AdminMiddleware";

const router = Router();

// Publik milih rute
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM rute ORDER BY id");
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rute]: any = await pool.query("SELECT * FROM rute WHERE id = ?", [req.params.id]);
  if (rute.length === 0) {
    res.status(404).json({ message: "Rute tidak ditemukan" });
    return;
  }
  const [halte] = await pool.query(
    "SELECT * FROM halte WHERE rute_id = ? ORDER BY urutan",
    [req.params.id]
  );
  res.json({ ...rute[0], halte });
});

// Admin
router.post("/", adminOnly, async (req: Request, res: Response) => {
  const { kode_rute, nama_rute, asal, tujuan } = req.body ?? {};
  if (!kode_rute || !nama_rute || !asal || !tujuan) {
    res.status(400).json({ message: "kode_rute, nama_rute, asal, tujuan wajib diisi" });
    return;
  }
  const [result]: any = await pool.query(
    "INSERT INTO rute (kode_rute, nama_rute, asal, tujuan) VALUES (?, ?, ?, ?)",
    [kode_rute, nama_rute, asal, tujuan]
  );
  res.status(201).json({ message: "Rute ditambahkan", id: result.insertId });
});

router.put("/:id", adminOnly, async (req: Request, res:Response) => {
  const { kode_rute, nama_rute, asal, tujuan } = req.body ?? {};
  if (!kode_rute || !nama_rute || !asal || !tujuan) {
    res.status(400).json({ message: "kode_rute, nama_rute, asal, tujuan wajib diisi" });
    return;
  }
  const [result]: any = await pool.query(
    "UPDATE rute SET kode_rute = ?, nama_rute = ?, asal = ?, tujuan = ? WHERE id = ?",
    [kode_rute, nama_rute, asal, tujuan, req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Rute tidak ditemukan" });
    return;
  }
  res.json({ message: "Rute diupdate" });
});

router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  const [result]: any = await pool.query("DELETE FROM rute WHERE id = ?", [req.params.id]);
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Rute tidak ditemukan" });
    return;
  }
  res.json({ message: "Rute dihapus (halte-nya ikut terhapus)" });
});

export default router;