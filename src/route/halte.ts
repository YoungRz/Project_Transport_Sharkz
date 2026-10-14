import { Router, Request, Response } from "express";
import { pool } from "../db/db";
import { adminOnly } from "../Middleware/AdminMiddleware";

const router = Router();

// Filter Publik nyari rute doang
router.get("/", async (req, res) => {
  const { rute_id } = req.query;
  const [rows] = rute_id
    ? await pool.query("SELECT * FROM halte WHERE rute_id = ? ORDER BY urutan", [rute_id])
    : await pool.query("SELECT * FROM halte ORDER BY rute_id, urutan");
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rows]: any = await pool.query("SELECT * FROM halte WHERE id = ?", [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ message: "Halte tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

// Admin 
router.post("/", adminOnly, async (req: Request, res: Response) => {
  const { rute_id, nama_halte, alamat, urutan } = req.body ?? {};
  if (!rute_id || !nama_halte || urutan === undefined) {
    res.status(400).json({ message: "rute_id, nama_halte, urutan wajib diisi" });
    return;
  }
  const [result]: any = await pool.query(
    "INSERT INTO halte (rute_id, nama_halte, alamat, urutan) VALUES (?, ?, ?, ?)",
    [rute_id, nama_halte, alamat ?? null, urutan]
  );
  res.status(201).json({ message: "Halte ditambahkan", id: result.insertId });
});

router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  const { rute_id, nama_halte, alamat, urutan } = req.body ?? {};
  if (!rute_id || !nama_halte || urutan === undefined) {
    res.status(400).json({ message: "rute_id, nama_halte, urutan wajib diisi" });
    return;
  }
  const [result]: any = await pool.query(
    "UPDATE halte SET rute_id = ?, nama_halte = ?, alamat = ?, urutan = ? WHERE id = ?",
    [rute_id, nama_halte, alamat ?? null, urutan, req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Halte tidak ditemukan" });
    return;
  }
  res.json({ message: "Halte diupdate" });
});

router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  const [result]: any = await pool.query("DELETE FROM halte WHERE id = ?", [req.params.id]);
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "Halte tidak ditemukan" });
    return;
  }
  res.json({ message: "Halte dihapus" });
});

export default router;